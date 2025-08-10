import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import json
import base64
from io import BytesIO
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import logging
from xhtml2pdf import pisa
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Google Drive configuration
SCOPES = ['https://www.googleapis.com/auth/drive.file']
CLIENT_SECRETS_FILE = os.environ.get('CLIENT_SECRETS_FILE')
REDIRECT_URI = os.environ.get('REDIRECT_URI')

def get_google_drive_service_oauth():
    """Create Google Drive service using OAuth2 credentials."""
    try:
        if 'credentials' not in session:
            return None
        
        creds_data = session['credentials']
        credentials = Credentials(
            token=creds_data['token'],
            refresh_token=creds_data.get('refresh_token'),
            token_uri=creds_data['token_uri'],
            client_id=creds_data['client_id'],
            client_secret=creds_data['client_secret'],
            scopes=creds_data['scopes']
        )
        
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            session['credentials'] = {
                'token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes
            }
        
        service = build('drive', 'v3', credentials=credentials)
        return service
        
    except Exception as e:
        logger.error(f"Error creating OAuth2 Drive service: {str(e)}")
        return None

@app.route('/auth/google')
def auth_google():
    """Initiate Google OAuth2 flow."""
    try:
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=REDIRECT_URI
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        session['state'] = state
        logger.info(f"Generated auth URL: {authorization_url}")
        
        return jsonify({
            'success': True,
            'auth_url': authorization_url,
            'message': 'Please visit the auth_url to authorize the application'
        })
        
    except Exception as e:
        logger.error(f"Error starting OAuth flow: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to start OAuth flow: {str(e)}'
        }), 500

@app.route('/oauth2callback')
def oauth2callback():
    """Handle OAuth2 callback."""
    try:
        state = session.get('state')
        
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            state=state,
            redirect_uri=REDIRECT_URI
        )
        
        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials
        
        session['credentials'] = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        return '''
        <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: green;">✅ Authorization Successful!</h1>
        <p>You can now close this window and return to your application.</p>
        <p>The application is now authorized to upload files to your Google Drive.</p>
        <script>
        setTimeout(function() {
            window.close();
        }, 3000);
        </script>
        </body>
        </html>
        '''
        
    except Exception as e:
        logger.error(f"Error in OAuth callback: {str(e)}")
        return f'''
        <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: red;">❌ Authorization Failed</h1>
        <p>Error: {str(e)}</p>
        <p>Please close this window and try again.</p>
        </body>
        </html>
        ''', 500

@app.route('/auth/status')
def auth_status():
    """Check if user is authenticated."""
    if 'credentials' in session:
        try:
            service = get_google_drive_service_oauth()
            if service:
                about = service.about().get(fields="user").execute()
                user = about.get('user', {})
                
                return jsonify({
                    'authenticated': True,
                    'user_email': user.get('emailAddress'),
                    'user_name': user.get('displayName')
                })
            else:
                return jsonify({'authenticated': False})
        except Exception as e:
            logger.error(f"Error checking auth status: {str(e)}")
            return jsonify({'authenticated': False, 'error': str(e)})
    else:
        return jsonify({'authenticated': False})

@app.route('/upload-to-drive', methods=['POST'])
def upload_to_drive():
    """Upload HTML or PDF file to Google Drive using OAuth2."""
    try:
        service = get_google_drive_service_oauth()
        if not service:
            return jsonify({
                'success': False,
                'error': 'Not authenticated. Please authenticate first.',
                'auth_required': True
            }), 401
        
        data = request.get_json()
        
        if not data or 'fileContent' not in data or 'fileName' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: fileContent and fileName'
            }), 400
        
        file_name = data['fileName']
        file_content_base64 = data['fileContent']
        mime_type = data.get('mimeType', 'application/pdf')
        convert_to_pdf = data.get('convertToPdf', False)
        
        logger.info(f"Attempting to upload file: {file_name}")
        
        try:
            file_content = base64.b64decode(file_content_base64)
            logger.info(f"Decoded file content: {len(file_content)} bytes")
        except Exception as e:
            logger.error(f"Base64 decode error: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Invalid base64 content: {str(e)}'
            }), 400
        
        # If this is HTML that needs to be converted to PDF
        if convert_to_pdf and mime_type == 'text/html':
            try:
                html_content = file_content.decode('utf-8')
                output = BytesIO()
                
                # Create PDF from HTML using xhtml2pdf
                pisa_status = pisa.CreatePDF(
                    BytesIO(html_content.encode('utf-8')),
                    dest=output
                )
                
                if pisa_status.err:
                    logger.error(f"PDF generation error: {pisa_status.err}")
                    return jsonify({
                        'success': False,
                        'error': f'Failed to generate PDF: {pisa_status.err}'
                    }), 500
                
                file_content = output.getvalue()
                mime_type = 'application/pdf'
                
                # Update filename to have .pdf extension
                if not file_name.lower().endswith('.pdf'):
                    file_name = os.path.splitext(file_name)[0] + '.pdf'
                    
            except Exception as e:
                logger.error(f"HTML to PDF conversion error: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': f'Failed to convert HTML to PDF: {str(e)}'
                }), 500
        
        file_stream = BytesIO(file_content)
        
        file_metadata = {
            'name': file_name,
        }
        
        media = MediaIoBaseUpload(
            file_stream,
            mimetype=mime_type,
            resumable=True
        )
        
        logger.info(f"Starting upload for file: {file_name}")
        
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id,name,webViewLink,webContentLink'
        ).execute()
        
        logger.info(f"File uploaded successfully. File ID: {file.get('id')}")
        
        return jsonify({
            'success': True,
            'fileId': file.get('id'),
            'fileName': file.get('name'),
            'webViewLink': file.get('webViewLink'),
            'webContentLink': file.get('webContentLink'),
            'message': 'File uploaded successfully to your Google Drive!'
        })
        
    except Exception as e:
        logger.error(f"Error uploading to Google Drive: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to upload file: {str(e)}'
        }), 500

@app.route('/logout')
def logout():
    """Clear authentication."""
    session.pop('credentials', None)
    session.pop('state', None)
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    })

if __name__ == '__main__':
    if not os.path.exists(CLIENT_SECRETS_FILE):
        logger.error(f"OAuth2 credentials file not found: {CLIENT_SECRETS_FILE}")
        print("Please download your OAuth2 credentials from Google Cloud Console:")
        print("1. Go to https://console.cloud.google.com/apis/credentials")
        print("2. Create OAuth 2.0 Client ID (Desktop application)")
        print("3. Download the JSON file and save as 'config/credentials.json'")
        print("4. Add redirect URI: http://localhost:5000/oauth2callback")
    else:
        logger.info("✅ OAuth2 credentials file found. Starting HTTP server...")
        print("🌐 OAUTHLIB_INSECURE_TRANSPORT is enabled for development")
        print("📝 Make sure your Google Cloud Console redirect URI is: http://localhost:5000/oauth2callback")
        app.run(debug=True, port=5000)