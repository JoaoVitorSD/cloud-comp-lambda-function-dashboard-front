import IORedis from 'ioredis';
export default async function handler(req, res) {
  const redisKey = 'joaodepollo-proj3-output';
  const client = new IORedis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
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
