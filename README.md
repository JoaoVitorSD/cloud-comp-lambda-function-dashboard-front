# dashboard lambda analysis

## Description

Dashboard desenolvido com Next.js e React para analisar os dados retornados pelo handler no redis. Utiliza o ioredis para se conectar ao redis e retornar o json consumido pelo cliente.
Para cada cpu no cpu_stats, é plotado com os _usages_ de cada cpu no último minuto. Além disso, as métricas de cache, memória utilizada e outgoing_traffic são disponibilizadas em uma caixa em cima dos graficos. Além da utilização de cada cpu, são plotados os gráficos da média de utilização de todos os cpus juntos, da média dos outputs e do tamanho do output do último input recebido pelo handler.  Os dados são atualizados a cada 5 segundos.
