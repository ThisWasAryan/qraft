import urllib.request
import json
import os

logos = {
    "whatsapp": "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    "instagram": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    "telegram": "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
    "discord": "https://raw.githubusercontent.com/devicons/devicon/master/icons/discord/discord-original.svg",
    "youtube": "https://raw.githubusercontent.com/devicons/devicon/master/icons/youtube/youtube-original.svg",
    "spotify": "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "github": "https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg",
    "google": "https://raw.githubusercontent.com/devicons/devicon/master/icons/google/google-original.svg"
}

os.makedirs('src/assets/presets/logos', exist_ok=True)

for name, url in logos.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            svg = response.read()
            with open(f"src/assets/presets/logos/{name}.svg", "wb") as f:
                f.write(svg)
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Failed {name}: {e}")
