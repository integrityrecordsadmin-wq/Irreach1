export default function handler(req, res) {
  res.status(200).json({
    message: "Hello! Serverless functions are working.",
    time: new Date().toISOString(),
  });
}
