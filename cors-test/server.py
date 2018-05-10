import tornado.ioloop
import tornado.web
import time

class BaseCORS(tornado.web.RequestHandler):

    def set_default_headers(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Allow-Headers', 'x-requested-with')
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def post(self):
        self.write('some post')

    closed = False
    
    def on_connection_close(self):
        self.closed = True
        
    @tornado.gen.coroutine
    def get(self):
        number = str(int(self.get_argument('number', '1')))
        size = int(self.get_argument('size', '1'))
        delay = float(self.get_argument('delay', '0'))
        set_length = int(self.get_argument('set_length', '1'))
        error = int(self.get_argument('error', '0'))

        if error:
            time.sleep(delay)
            self.send_error(error)
            return

        if set_length:
            self.set_header('Content-Length', size * (len(number) + 2))

        self.write('[')

        for i in range(size):
            if i == 0:
                self.write('%s' % number)
            else:
                self.write(', %s' % number)

            self.flush()

            if self.closed:
                print('closed')
                break

            yield tornado.gen.Task(
                tornado.ioloop.IOLoop.instance().add_timeout,
                tornado.ioloop.IOLoop.instance().time() + delay,
            )

        self.write(']')
        self.finish()

    def options(self):
        self.set_status(204)
        self.finish()

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/cors", BaseCORS),
    ], debug=True)

if __name__ == "__main__":
    app = make_app()
    app.listen(3003)
    tornado.ioloop.IOLoop.current().start()
