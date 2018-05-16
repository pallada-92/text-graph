import tornado.ioloop
import tornado.web
import base64
import os

class BaseCORS(tornado.web.RequestHandler):

    def set_default_headers(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Allow-Headers', 'x-requested-with')
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def options(self):
        self.set_status(204)
        self.finish()

class MainHandler(BaseCORS):
    def post(self):
        scene = self.get_argument('scene')
        dirs = '../frames/%s' % scene
        if not os.path.exists(dirs):
            os.makedirs(dirs)
        frame = int(self.get_argument('frame'))
        _, data = str(self.request.body).split(',', 1)
        fname = '../frames/%s/%06d.png' % (scene, frame)
        with open(fname, 'wb') as f:
            f.write(base64.b64decode(data))
        self.write("OK %s" % fname)

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
    ], debug=True)

if __name__ == "__main__":
    app = make_app()
    app.listen(4004)
    tornado.ioloop.IOLoop.current().start()
