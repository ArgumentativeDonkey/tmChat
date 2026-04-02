To create a bot, create a `yourbotname.py` file in the same directory as `bot.py`. `bot.py` is currently configured to work with the main tmchat server, but you can change variables found at the top of the file to work with any instance. Begin your python file with `import bot`. Then, create a function to process the payload. This function will run whenever a message is sent by anybody other than the bot itself. An example function is shown below:
```
def echoMessage(bot:bot.Bot,payload):
    bot.send_message(payload['data']['record']['content'])
```
The 'bot' and 'payload' parameters are required for functionality.
Now create the bot class, for example:
```
echoBot = bot.Bot("EchoBot", echoMessage)
```
The bot will automatically run when created.
