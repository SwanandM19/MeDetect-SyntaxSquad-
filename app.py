from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ROBOFLOW_API_URL = "https://detect.roboflow.com/skin-disease-detection-phsnp/2"
API_KEY = "pGJ0P7QVhYQ5vZl5rULv"  # Replace this with your real key

@app.route("/", methods=["GET", "POST"])
def index():
    result = None
    image_url = None

    if request.method == "POST":
        if "image" not in request.files:
            return "No file part", 400

        file = request.files["image"]
        if file.filename == "":
            return "No selected file", 400

        if file:
            # Save image locally
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)  # ✅ Ensure folder exists
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filepath)


            # Send to Roboflow
            with open(filepath, "rb") as f:
                response = requests.post(
                    ROBOFLOW_API_URL + f"?api_key={API_KEY}",
                    files={"file": f},
                )

            if response.ok:
                result = response.json()["predictions"]
                image_url = filepath
            else:
                result = [{"error": "API call failed"}]

    return render_template("chatbotvoice.html", result=result, image_url=image_url)


@app.route('/newpage', methods=['GET'])
def new_page():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
