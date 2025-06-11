# Nesahub Deployment Guide

This guide will walk you through deploying the Nesahub application using Docker Compose. The application is split into two main services: `webapp` and `socket-server`.

## 📦 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Git](https://git-scm.com/downloads) installed
- Optional: A code/text editor like [VS Code](https://code.visualstudio.com/) or [nano](https://www.nano-editor.org/)

## 🚀 Deployment Steps

1.  **Clone the deployment config branch**

    ```bash
    git clone -b deploy-config https://github.com/gbagush/nesahub.git nesahub-app
    cd nesahub-app
    ```

2.  **Clone application repositories into subfolders**

    ```bash
    git clone -b main https://github.com/gbagush/nesahub.git webapp
    git clone -b socketio-server https://github.com/gbagush/nesahub.git socket-server
    ```

3.  **Prepare production environment variables**

    ```bash
    cp .env.grafana.example .env.grafana
    nano .env.grafana # or use any text editor to configure the environment

    cd webapp
    cp .env.example .env
    nano .env         # configure again for webapp

    cd ../socket-server
    cp .env.example .env
    nano .env         # configure again for socket-server
    ```

4.  **Create monitoring network**

    ```bash
    docker network create monitoring
    ```

5.  **Build and run the application**

    ```bash
    docker-compose up --build
    ```

6.  **Run in detached/background mode**
    ```bash
    docker-compose up -d
    ```

## 🔌 Port Mapping

Once the containers are running, the following services will be available by default:

| Service       | Port   |
| ------------- | ------ |
| Grafana       | `3000` |
| Socket Server | `3001` |
| Web App       | `3002` |

## 🌐 Exposing Services via Nginx Reverse Proxy

To access the `webapp` and `socket-server` from a domain, you can configure an Nginx reverse proxy.
