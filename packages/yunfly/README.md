# Yunfly

Yunfly. A high-performance Node.js web framework.

Building our application using `Typescript`.

Using `Koa2` as the HTTP underlying framework. Using `routing-controllers` and `typedi` to efficiently build our Node application.

## Technology

- Koa2: node.js HTTP framework.
- find-my-way: Crazy fast http radix based router.
- Typescript: TypeScript is a language for application scale JavaScript development.
- routing-controllers: Create structured, declarative and beautifully organized class-based controllers with heavy decorators usage for Express / Koa using TypeScript.
- typedi: Dependency injection for TypeScript.
- winston: A logger for just about everything.

## Perfomance

### Docker environment

> Memory: 1GB
> Cpu: 1GHz

- hello world!

| framework | qps | remarks |
| ------ | ------| ------ |
| yunfly | 6400 | use koa as the underlying library |
| eggjs| 3950 | use koa as the underlying library |
| nestjs| 2900 | use koa as the underlying library |
| nestjs| 7200 | use fastify as the underlying library |

- 1000 routing

| framework | qps | remarks |
| ------ | ------| ------ |
| yunfly | 6100 | use koa as the underlying library |
| eggjs| 1680 | use koa as the underlying library |
| nestjs| 2050 | use koa as the underlying library |
| nestjs| 6550 | use fastify as the underlying library |

## Document Address

<https://yunke-yunfly.github.io/doc.github.io/>
