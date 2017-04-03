<?php
error_reporting(0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: OPTIONS, GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control");

if (isset($_REQUEST['url']))
{
  {
    $urls = parse_url($_REQUEST['url']);
    $ip = gethostbyname($urls['host']);
    if ($ip == "127.0.0.1") {
      die("localhost denied");
    } else if (!($urls['scheme'] == "http" || $urls['scheme'] == "https")) {
      die("only http/s allowed");
    } else if ($_SERVER['SERVER_ADDR'] == $_SERVER['REMOTE_ADDR']) {
      die("recursion denied");
    }
  };

  $ch = curl_init($_REQUEST['url']);
  for ($trys = 5; $trys > 0; $trys--)
  {
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
      'X-Forwarded-For: ' . $_SERVER['REMOTE_ADDR']
    ));
    $content = curl_exec($ch);
    if ($content) {
      break;
    }
  }
  $mime_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
  header("Content-Type: $mime_type");
  http_response_code(curl_getinfo($ch, CURLINFO_HTTP_CODE));
  echo $content;
}
else
{
  $errortext = "<form method=\"GET\" action=\"\"><input required=\"required\" name=\"url\" type=\"url\" /><input type=\"submit\" value=\"Open\" /></form>";
  die($errortext);
}
