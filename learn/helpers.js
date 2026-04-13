
function sendResponse(response, statusCode, message) 
{
  response.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(message);
}
module.exports = {sendResponse};