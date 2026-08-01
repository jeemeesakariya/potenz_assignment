# Postman API collection

Import these two files into Postman:

1. `Potenz-Job-Portal-API.postman_collection.json`
2. `Potenz-Job-Portal-Production.postman_environment.json`

Select **Potenz Job Portal - Production** as the active environment. Run requests in numbered folder order. The registration request creates a unique email and saves the JWT automatically; the jobs request saves `jobId`, and application submission saves `applicationId`.

Before running application requests, open **Upload Resume - Select File First**, choose a PDF, DOC, or DOCX file under **Body → form-data**, and send it. Postman does not embed local files in exported collections.

The production base URL is `https://potenz-assignment.onrender.com`. A first request can take about one minute when the free Render service is asleep.
