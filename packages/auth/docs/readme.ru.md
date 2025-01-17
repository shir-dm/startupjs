import { useState } from 'react'
import { AuthForm, LogoutButton, onLogout } from '../'
import { AuthButton as GoogleAuthButton } from '@startupjs/auth-google'
import { AuthButton as LinkedinAuthButton } from '@startupjs/auth-linkedin/client'
import { LoginForm, RegisterForm, RecoverForm } from '@startupjs/auth-local'
import { Button } from '@startupjs/ui'

# Авторизация

## Требования

```
@react-native-cookies/cookies: >= 6.0.6
@startupjs/ui: >= 0.33.0
startupjs: >= 0.33.0
```

## Описание

## Инициализация на сервере
```js
import { initAuth } from '@startupjs/auth/server'
```

В теле функции **startupjsServer** происходит инициализация модуля, в **strategies** добавляются стратегии каждая со своим набором характеристик:
```js
initAuth(ee, {
  strategies: [
    new LocalStrategy({}),
    new FacebookStrategy({
      clientId: conf.get('FACEBOOK_CLIENT_ID'),
      clientSecret: conf.get('FACEBOOK_CLIENT_SECRET')
    })
  ]
})
```

## Micro frontend
[Тестовый пример](/auth/sign-in)
(ключи apple и azure скрыты из публичного доступа и их нужно добавлять вручную)

Представляет собой готовые страницы с формами, которые можно подключить на сайт

Чтобы их использовать, нужно в файле Root/index.js (либо где используется startupjs/app), заинитить микро фронтент и положить его в App компонент

Для начала нужна функция инициализатор, которая принимает нужные опции:
```js
import { initAuthApp } from '@startupjs/auth'
```

Основные ее опции - это socialButtons и localForms, которые собирают нужные компоненты для общей формы. Т.к. заранее неизвестно какие стратегии должны быть подключены, приходиться подключать их самим. Кнопки есть практически у каждой стратегии, кроме локальной, чтобы ознакомиться какие компоненты существуют для auth-local, есть отдельное описание для этой стратегии (собственно как и для всех других).

Импорт нужных компонентов:
```js
import { AuthButton as AzureadAuthButton } from '@startupjs/auth-azuread'
import { AuthButton as LinkedinAuthButton } from '@startupjs/auth-linkedin'
import { LoginForm, RegisterForm, RecoverForm } from '@startupjs/auth-local'
```

Все базируется на локальной стратегии. Она имеет 3 стандартных формы: Авторизация, Регистрация, Восстановление пароля. Между этими формами происходит переключение под капотом.
Микрофронтенд имеет 3 обязательных роута для локальной стратегии: 'sign-in', 'sign-up' и 'recover', собственно при использовании локальной формы, всегда нужно чтобы по этим ключам были установлены компоненты с формами.

```jsx
const auth = initAuthApp({
  localForms: {
    'sign-in': <LoginForm />,
    'sign-up': <RegisterForm />,
    'recover': <RecoverForm />
  },
  socialButtons: [
    <AzureadAuthButton />,
    <LinkedinAuthButton />
  ]
})
```

Когда микрофронтенд сгенерирован, нужно просто передать его в App
```pug
App(apps={ auth, main })
```

И так же добавить роуты для сервере
```js
import { getAuthRoutes } from '@startupjs/auth/isomorphic'
//...
appRoutes: [
  ...getAuthRoutes()
]
//...
```

### Кастомизация микрофронтенда
Можно изменить `Layout`. К примеру у сайта есть своя шапка, лого, фон и т.д.
Для этого можно прокинуть кастомный Layout в опции микрофронтенда:

```jsx
const auth = initAuthApp({
  Layout,
  localForms: {
    'sign-in': <LoginForm />,
    'sign-up': <RegisterForm />,
    'recover': <RecoverForm />
  }
})
```

Поскольку в localForms и socialButtons прокидывается jsx, все компоненты можно модифицировать как обычно:
```jsx
const auth = initAuthApp({
  Layout,
  localForms: {
    'sign-in': <LoginForm
      properties={{
        age: {
          input: 'number',
          label: 'Age',
          placeholder: 'Enter your age'
        }
      }}
      validateSchema={{
        age: Joi.string().required().messages({
          'any.required': 'Fill in the field',
          'string.empty': 'Fill in the field'
        })
      }}
    />,
    'sign-up': <RegisterForm />,
    'recover': <RecoverForm />
  },
  socialButtons: [
    <GoogleAuthButton
      label='Sign in with Google'
    />,
    <FacebookAuthButton
      label='Sign in with Facebook'
    />
  ]
})
```

Подробно о кастомизации этих компонентов описано на страницах с нужными стратегиями

Если нужно изменить стандартные заголовки и сделать свою разметку, можно применить функцию renderForm:
```jsx
const auth = initAuthApp({
  Layout,
  localForms: {
    'sign-in': <LoginForm />,
    'sign-up': <RegisterForm />,
    'recover': <RecoverForm />
  },
  socialButtons: [
    <GoogleAuthButton />,
    <FacebookAuthButton />
  ],
  renderForm: function ({
    slide,
    socialButtons,
    localActiveForm,
    onChangeSlide
  }) {
    return pug`
      Div
        H5= getCaptionForm(slide)
        = socialButtons
        Div(style={ marginTop: 16 })
          = localActiveForm
    `
  }
})
```

Она получает те формы которые объявлены, и текущий слайд

## Общий компонент
Общая форма с нужными видами авторизации
Все тоже самое что и для микрофронтенда, только нет роутов, и переключение слайдов нужно настроить самим

```js
import { AuthForm } from '@startupjs/auth'
```

```jsx example
const [slide, setSlide] = useState('sign-in')

return (
  <AuthForm
    slide={slide}
    localForms={{
      'sign-in': <LoginForm />,
      'sign-up': <RegisterForm />,
      'recover': <RecoverForm />
    }}
    socialButtons={[
      <GoogleAuthButton label='Sign in with Google' />,
      <LinkedinAuthButton />
    ]}
    onChangeSlide={slide=> setSlide(slide)}
  />
)
```

## Хэлперы и серверные хуки

### Кнопка выйти
```jsx
import { LogoutButton } from '@startupjs/auth'
...
return <LogoutButton />
```

### Хэлпер для выхода
```jsx
import { onLogout } from '@startupjs/auth'
...
return <Button onPress={onLogout}>Выйти</Button>
```

### onBeforeLoginHook
Хэлпер-мидлвара, вызывается перед авторизацией

```jsx
initAuth(ee, {
  // ...
  onBeforeLoginHook: ({ userId }, req, res, next) => {
    console.log('onBeforeLoginHook')
    next()
  },
  // ...
}
```

### onAfterUserCreationHook
Хэлпер-мидлвара, вызывается после создания юзера

```jsx
initAuth(ee, {
  // ...
  onAfterUserCreationHook: ({ userId }, req) => {
    console.log('onAfterUserCreationHook')
  },
  // ...
}
```

### onAfterLoginHook
Хэлпер-мидлвара, вызывается после авторизации

```jsx
initAuth(ee, {
  // ...
  onAfterLoginHook: ({ userId }, req) => {
    console.log('onAfterLoginHook')
  },
  // ...
}
```

### onBeforeLogoutHook
Хэлпер-мидлвара, вызывается перед выходом

```jsx
initAuth(ee, {
  // ...
  onBeforeLogoutHook: (req, res, next) => {
    console.log('onBeforeLogoutHook')
    next()
  },
  // ...
}
```

## Редирект после авторизации
Чтобы настроить редирект, нужно прокинуть пропсом redirectUrl в initAuthApp, либо для AuthForm, либо для отдельной кнопки или формы, н-р:
`<GoogleAuthButton redirectUrl='/profile/google' />`
`<LoginForm redirectUrl='/profile/local' />`

Редирект работает через куки, и если положить что-то в куку с именем redirectUrl до авторизации, после нее произойдет редирект на value из куки:

```js
  import { CookieManager } from '@startupjs/auth'

  CookieManager.set({
    baseUrl,
    name: 'authRedirectUrl',
    value: redirectUrl,
    expires: moment().add(5, 'minutes')
  })
```

Так же, можно переопределять редирект и на сервере (к примеру в хуке onBeforeLoginHook):

```js
  onBeforeLoginHook: ({ userId }, req, res, next) => {
    // req.cookies.authRedirectUrl = '/custom-redirect-path'
    next()
  }
```
