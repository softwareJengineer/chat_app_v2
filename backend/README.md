# Speech System / Backend
Django based backend. Provides database access via an API and provides the chat function via WebSocket.


### ToDo:
* In ```db_services.py``` add functionality to calculate topics and analysis and save them when the session is closed. Also get/create the user's goal and add 1 to it.
    - There is some old sample code in a comment at the top that can be used as a reference.
* Biomarker calculations need to be looked over. Specific inputs like time ranges, single words, full conversation, etc.
* Django secret key moved to ```.env``` file or config. Turn debug mode on and off via environment variables as well.
* Make sure ```requirements-web.txt``` actually covers everything.
* When we load a chat, check if X minutes have passed since the last interaction, and if so close it and create a new one.
    - Means we need to add in a "last interaction" timer... Or I guess I can use the same logic as start_ts for end_ts.

<br>


## Java Access

<details closed> <summary> Send username and password to get an access token </summary>

```java
// Build JSON payload
String body = """{"username": "robot_user01", "password": "password"}""";

// POST to /api/token/
HttpClient  client   = HttpClient.newHttpClient();
HttpRequest loginReq = HttpRequest.newBuilder()
        .uri(URI.create("https://cognibot.org/api/token/"))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build();

HttpResponse<String> loginRes = client.send(loginReq, HttpResponse.BodyHandlers.ofString());

// Parse {"access":"...", "refresh":"..."}
String accessToken  = Json.parse(loginRes.body()).at("/access" ).asText();
String refreshToken = Json.parse(loginRes.body()).at("/refresh").asText();
```
</details>


<details closed> <summary> Call any API endpoint </summary>

```java
HttpRequest profileReq = HttpRequest.newBuilder()
        .uri(URI.create("https://cognibot.org/api/profile/"))
        .header("Authorization", "Bearer " + accessToken)
        .GET()
        .build();

HttpResponse<String> profileRes = client.send(profileReq, HttpResponse.BodyHandlers.ofString());
```
</details>


<details closed> <summary>  Open the WebSocket chat </summary>

```java
String wsURL = "wss://cognibot.org/ws/chat/"
             + "?token=" + accessToken        // authorization
             + "&source=buddyrobot";          // device (webapp, buddyrobot)

WebSocket webSocket = client.newWebSocketBuilder()
        .buildAsync(URI.create(wsURL), new ChatListener())
        .join();
```
</details>


<br>

## LLama API Server
<details closed> <summary> Will be moved to separate instance </summary>

Default ```User``` model contains an ```is_staff``` field. Database should be initialized with some starter data for testing, but also with some admin profiles. Admin profiles will havve ```is_staff``` and should be able to access a page that gets the status of the Google cloud compute instance hosting the LLM. If offline, a button will be available to send a command to restart the server automatically.

</details>

