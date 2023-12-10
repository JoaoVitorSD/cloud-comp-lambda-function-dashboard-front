import IORedis from 'ioredis';
export default async function handler(req, res) {
  const redisHost = 'localhost';
  const redisPort = 6379;
  const redisKey = 'joaodepollo-proj3-output';
  const client = new IORedis({
    host: redisHost,
    port: redisPort,
  });
  try{
    const data = await client.get(redisKey);
    res.status(200).json(JSON.parse(data));
  }catch(e){
    console.error(e);
    res.status(500).json({error: e});
  }
  finally{
    client.quit();
  }
}
