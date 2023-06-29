<%
 
Dim src, wordsArray, centerLetter, outerLetters, answers
src = Request.Form("src")


 
 









Function GetValueBetween( haystack,  startStr,  endStr)
    Dim startPos, endPos

    ' Find the starting position of the specified start string
    startPos = InStr(haystack, startStr)
    
    ' If the start string is found
    If startPos > 0 Then
        ' Find the ending position of the specified end string
        endPos = InStr(startPos + Len(startStr), haystack, endStr)
        
        ' If the end string is found
        If endPos > 0 Then
            ' Extract the value between the start and end strings
            GetValueBetween = Mid(haystack, startPos + Len(startStr), endPos - startPos - Len(startStr))
        Else
            ' Handle the case when the end string is not found
            GetValueBetween = ""
        End If
    Else
        ' Handle the case when the start string is not found
        GetValueBetween = ""
    End If
End Function
 
%>


 
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" :content="meta.description" />
    <meta name="generator" :content="eleventy.generator" />
    <title @html="meta.title"></title>
    <link rel="icon" type="image/png" href="/icon32x32.png" />

    <link rel="manifest" href="/manifest.json" />

    <!-- Pre-connect to the jsdelivr cdn since we'll be loading a few 3rd party libraries from there -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net" />

    <!-- Critical JS and CSS -->
    <script @raw="getBundle('js', 'critical')" type="module" webc:keep></script>
    <script webc:bucket="critical">
      // navigator.serviceWorker.register("/sw.js");
      // Ask for persistent storage so it won't be lost when the browser is closed on iOS
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist();
      }
    </script>

    <style @raw="getBundle('css', 'critical')" webc:keep></style>

    <link rel="stylesheet" href="./styles/reset.css" webc:bucket="critical" />

    <!-- Defer non-critical CSS -->
    <link
      rel="preload"
      :=href="getBundleFileUrl('css')"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'"
      webc:keep
    />

    <!-- AlpineJS -->
    <script
      :src="getBundleFileUrl('js', 'alpine')"
      type="module"
      webc:keep
    ></script>
    <script src="./js/game.mjs" webc:bucket="alpine"></script>
  </head>
  <body x-data>
  <script>
 

 
<%
 
If Len(src) > 0 Then
    centerLetter = GetValueBetween(src, """centerLetter"":""", """")
    outerLetters = GetValueBetween(src, """outerLetters"":[", "]")
    answers = GetValueBetween(src, """answers"":[", "]")
    response.write "window.answers = [" & answers & "];"   & vbCrLf
    response.write "var centerLetter = """ & centerLetter & """;" & vbCrLf
    response.write "var outerLetters = [" & outerLetters & "]" & vbCrLf
    response.write "window.letters = centerLetter +outerLetters.join("""")" + ";"  &  vbCrLf
 
End If

%>
 </script>
    <loading-indicator x-show="false"></loading-indicator>
    <div x-cloak>
      <page-header></page-header>
      <page-main></page-main>
    </div>

    <!-- Non-critical JS -->
    <script :src="getBundleFileUrl('js')" type="module" webc:keep></script>

    <script src="./js/fireConfetti.mjs"></script>
  </body>
</html>
