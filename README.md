### Hexlet tests and linter status:
[![Actions Status](https://github.com/NataliPele/qa-auto-engineer-javascript-project-90/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/NataliPele/qa-auto-engineer-javascript-project-90/actions)

### Project CI and Quality:
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=NataliPele_qa-auto-engineer-javascript-project-90&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=NataliPele_qa-auto-engineer-javascript-project-90)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=NataliPele_qa-auto-engineer-javascript-project-90&metric=bugs)](https://sonarcloud.io/summary/new_code?id=NataliPele_qa-auto-engineer-javascript-project-90)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=NataliPele_qa-auto-engineer-javascript-project-90&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=NataliPele_qa-auto-engineer-javascript-project-90)

_____________________________________________________________________________________________________________________________________

    Task Manager E2E Tests (Playwright)
Этот проект содержит полный набор автоматизированных e2e-тестов для учебного приложения Hexlet Task Manager.
Тесты покрывают ключевые пользовательские сценарии веб-интерфейса: авторизация, Kanban-доска задач, метки, статусы, пользователи и операции CRUD.
Проект разработан в рамках курса по автоматизации тестирования JavaScript и демонстрирует:
-организацию тестов по Page Object Model,
-использование Playwright,
-грамотный сценарный и модульный подход,
-применение принципов DRY и читаемости тестов,
-работу с GitHub Actions и статическим анализом.

_____________________________________________________________________________________________________________________________________

    Установка и запуск приложения
Проект тестирует готовое приложение Task Manager, предоставленное Хекслетом через npm-пакет.
Официальная инструкция:
https://www.npmjs.com/package/@hexlet/testing-task-manager

1. Установите приложение Task Manager
npm install -g @hexlet/testing-task-manager

2. Импортируйте и запустите приложение
  import React from 'react'
  import ReactDOM from 'react-dom/client';
  import App from '@hexlet/testing-task-manager';

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      {App()}
    </React.StrictMode>
  )
3. Запустите сервер приложения
npm run dev
По умолчанию приложение доступно по адресу:
http://localhost:5173
Убедись, что сервер работает, прежде чем запускать тесты.