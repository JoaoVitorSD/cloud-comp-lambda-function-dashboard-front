# dashboard lambda analysis

## Description

Dashboard desenolvido com Next.js e React para analisar os dados retornados pelo handler no redis. Utiliza o ioredis para se conectar ao redis e retornar o json consumido pelo cliente.
Para cada cpu no cpu_stats, é plotado com os _usages_ de cada cpu no último minuto. Além disso, as métricas de cache, memória utilizada e outgoing_traffic são disponibilizadas em uma caixa em cima dos graficos. Além da utilização de cada cpu, são plotados os gráficos da média de utilização de todos os cpus juntos, da média dos outputs e do tamanho do output do último input recebido pelo handler.  Os dados são atualizados a cada 5 segundos.


## Running

No kubernets, está rodando um container com a imagem joaovitorsd/lambda-dashboard-analysis:latest. Para rodar localmente, é necessário ter o docker instalado e um túnel ssh do redis.

- A aplicação usa as variáveis de ambiente REDIS_HOST, e REDIS_PORT para conectar com o REDIS. Caso não sejam definidas, o programa não irá funcionar. 
- Rodando localmente(fora da VM): Necessário tunneling para o redis, necessário passar REDIS_HOST e REDIS_PORT como variáveis de ambiente. 
```bash
docker pull joaovitorsd/lambda-dashboard-analysis:latest
docker run -p 3000:3000 -env REDIS_HOST="localhost" REDIS_PORT=6379 joaovitorsd/lambda-dashboard-analysis:latest
```
- Rodando na VM: Necessário passar REDIS_HOST e REDIS_PORT como variáveis de ambiente. 
```bash
docker pull joaovitorsd/lambda-dashboard-analysis:latest
docker run -p 3000:3000 -env REDIS_HOST="192.168.121.66" REDIS_PORT=6379 joaovitorsd/lambda-dashboard-analysis:latest
```

