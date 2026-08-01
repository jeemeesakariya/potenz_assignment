# Postman quick start

Import these two files into Postman:

1. `Potenz-Job-Portal-API.postman_collection.json`
2. `Potenz-Job-Portal-Production.postman_environment.json`

Select **Potenz Job Portal - Production**, then run the numbered folders in order. The collection automatically saves the JWT, `jobId`, and `applicationId`.

Before applying, open **Upload Resume - Select File First** and choose a PDF, DOC, or DOCX file under **Body → form-data**.

The production base URL is `https://potenz-assignment.onrender.com`. A first request can take about one minute when the free Render service is asleep.
