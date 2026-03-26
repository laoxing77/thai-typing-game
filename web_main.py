import os

from typing_game.webapp import run_web_app


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    run_web_app(host=host, port=port)
