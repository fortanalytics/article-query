from aiohttp import web
from aiohttp.web_runner import GracefulExit
import asyncio
import nest_asyncio
import socketio
import pandas as pd
import json
import os
import sys
import traceback



sio = socketio.AsyncServer(async_mode="aiohttp")
app = web.Application()
sio.attach(app)
nest_asyncio.apply()
path = os.path.dirname(os.path.abspath(sys.argv[0]))

@sio.on('connect')
def connect(sid,environ):
    print("connected: ", sid)

@sio.on('message')
async def message(sid,data):
    try:
        received_data = json.loads(data)
        print("data received")
        if len(received_data['article_list'])>0: #if received_data is dict and not empty
            t1 = pd.DataFrame(received_data['article_list']).sort_values(['org','date'], ascending=[True,False])
            t1['date'] = pd.to_datetime(t1['date']).dt.tz_localize(None)
            t2 = t1.assign(date=t1['date'].dt.strftime("%Y-%m-%d"))
            t2.to_excel(os.path.join(path, "article_table.xlsx"), index=False, engine='openpyxl')
            t2.to_csv(os.path.join(path, "article_table.csv"), encoding='utf-8', index=False)
            await sio.emit("success", "Message from table.py: Table has been loaded")
            html_table = json.dumps(t2.to_html(index=False, render_links=True), separators=(',',':')).rstrip()
            await sio.emit("table", html_table)
        else:
            await sio.emit("success", "Message from table.py: empty dictionary was sent")
    except Exception as e:
        await sio.emit("error", f"Error thrown from table.py - @sio.on(message) - message function : {str(repr(e))}")
        await print(f"An unexpected error occurred: {str(repr(e))}")
        #await sio.emit("error", str(traceback.format_exc()))
        #await print(str(traceback.format_exc()))

@sio.on('disconnect')
def disconnect(sid):
    print("disconnected: ", sid)

@sio.on('shutdown')
async def shutdown(sid):
    await sio.emit('close', "Shutting down table.py")
    raise GracefulExit()

if __name__ =='__main__':
    web.run_app(app, host='0.0.0.0', port=3003)

