# Clear proxy environment variables
$env:HTTP_PROXY = ''
$env:HTTPS_PROXY = ''
$env:http_proxy = ''
$env:https_proxy = ''

# Start ngrok
.\tools\ngrok\ngrok.exe http 3001 --domain=lulu-frockless-impededly.ngrok-free.dev