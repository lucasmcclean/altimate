<div align="center">
<img src="frontend/react/public/FULL_LOGO.webp" alt="Altimate Logo" width="300"/>

<p>

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Gemini](https://img.shields.io/badge/gemini-75A5EB?style=for-the-badge&logo=google&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

</p>
</div>

# Altimate

Web accessibility, despite becoming more broadly addressed, is still a widely
misunderstood and underrecognized challenge. Many websites fail to address common
web accessibility concerns, and many more fail to address lesser-known issues
that, regardless, have a large impact on people's lives.

## Making Accessibility Available to Devs and Users Alike

Many applications, linters, and practices guide devs to design more accessible
sites. **Altimate** (/ˈʌl.tɪ.mɪt/) takes a different approach by meeting developers
where they are with already published sites and granting users the power to bring
accessibility to any site they visit.

## Reaching Beyond Basic Accessibility

Tools that can statically analyze and programmatically address accessibility issues
serve a foundational role on the web. But there is a lack of 'semantic'
accessibility tools that can take their role one step further by making context-aware
decisions and taking unique approaches to ensuring an accessible web. **Altimate**
does just that.

## Preparing and Running the Chrome Extention

### Frontend

The files for the frontend with a external backend are currently being hosted at [lucasmcclean.github.io/altimate-showcase/](https://lucasmcclean.github.io/altimate-showcase/).

To run the app entirely locally:
- `git clone` this repository
- `cd altimate/frontend/react`
- Run `npm i && npm run build`
- Make the chrome extension
    - Go to chrome
    - Go to "Manage Extensions"
    - Turn on Developer Mode
    - Select "Load unpacked"
    - Select the newly created dist folder inside frontend/react

### Backend 

The backend is currently being hosted at [altimate.onrender.com](https://altimate.onrender.com/).

To run the backend locally (only works for a locally hosted frontend):
- `git clone` this repository (Should already be done from hosting frontend)
- `cd altimate/api`
- Make sure your gemini key is exposed as `GOOGLE_API_KEY`
- Setup a python virtual environment (Optional but recommended)
- `pip install google-genai fastapi[standard]`
- Run `fastapi dev`
