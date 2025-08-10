import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();

    form.parse(req.nextUrl.searchParams.has("dummy") ? req.body : req, async (err, fields, files) => {
      if (err) {
        resolve(NextResponse.json({ error: "File upload failed" }, { status: 500 }));
        return;
      }

      try {
        const fileStream = fs.createReadStream(files.image.filepath);
        const formData = new FormData();
        formData.append("file", fileStream);

        const apiKey = process.env.ROBOFLOW_API_KEY;
        const modelEndpoint = "https://detect.roboflow.com/skin-disease-detection-phsnp/2";

        const response = await fetch(`${modelEndpoint}?api_key=${apiKey}`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        resolve(NextResponse.json(data));
      } catch (error) {
        resolve(NextResponse.json({ error: error.message }, { status: 500 }));
      }
    });
  });
}
