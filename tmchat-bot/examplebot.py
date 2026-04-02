import bot
def echoMessage(bot:bot.Bot,payload):
    bot.send_message(payload['data']['record']['content'])
echoBot = bot.Bot("EchoBot", echoMessage)