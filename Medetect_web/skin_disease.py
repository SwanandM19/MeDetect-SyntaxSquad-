from fastapi import FastAPI, File, UploadFile, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
import requests
from typing import List

app = FastAPI()

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ROBOFLOW_API_URL = "https://detect.roboflow.com/skin-disease-detection-phsnp/2"
API_KEY = "pGJ0P7QVhYQ5vZl5rULv"

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")

# Template directory
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse("chatbotvoice.html", {"request": request, "result": None, "image_url": None})


@app.post("/", response_class=HTMLResponse)
async def post_index(request: Request, image: UploadFile = File(...)):
    result = None
    image_url = None

    if image.filename == "":
        return templates.TemplateResponse("chatbotvoice.html", {
            "request": request,
            "result": [{"error": "No selected file"}],
            "image_url": None
        })

    file_location = os.path.join(UPLOAD_FOLDER, image.filename)
    with open(file_location, "wb") as f:
        f.write(await image.read())

    # Send image to Roboflow
    with open(file_location, "rb") as f:
        response = requests.post(
            ROBOFLOW_API_URL + f"?api_key={API_KEY}",
            files={"file": f},
        )

    if response.ok:
        result = response.json().get("predictions", [])
        image_url = "/" + file_location  # static path for rendering
    else:
        result = [{"error": "API call failed"}]

    return templates.TemplateResponse("chatbotvoice.html", {
        "request": request,
        "result": result,
        "image_url": image_url
    })


@app.get("/newpage", response_class=HTMLResponse)
async def new_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
