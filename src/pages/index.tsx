import Head from 'next/head'
import Box from '@components/box'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
export default function Home() {


  const [cpus, setCpus] = useState<any>([]);
  const [cpuKeys, setCpusKey] = useState<any>([]);
  const [outputsAvg, setOutputsAvg] = useState<number[]>([]);
  const [interation, setInteration] = useState<number>(1);
  const [outputs, setOutputs] = useState<number[]>([]);
  const [cpusUsage, setCpusUsage] = useState<any>({});


  const lineColors = ['#8884d8', '#82ca9d', '#aa8437', '#ff7f0e', '#d62728', '#9467bd', '#8c564b',
    '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#1f77b4', '#aec7e8', '#ffbb78', '#98df8a', '#ff9896',
    '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5', '#aec7e8', '#ffbb78', '#98df8a'];
  const [data, setData] = useState<any>({});

  async function loadData(iteration: number) {

    await fetch('/api/redis')
      .then(response => {
        if (response.status == 200) return response.json();
        return null;
      })
      .then((data: any) => {
        if (!data) return;
        const parsed = data.cpus_avg.reduce((acc: any, cpu: any) => {
          const keys = Object.keys(cpu);
          const key = `${keys[0]}`;
          acc[key] = parseFloat(cpu[key].toFixed(2));
          return acc;
        }, {});

        if (iteration > 12) {
          iteration = 12;
          setCpus((prevCpus: any) => [...prevCpus.filter((cpu: any) => cpu.name != 1).map((cpu: any) => ({ ...cpu, 'name': cpu.name <= 1 ? 1 : cpu.name - 1 })), { 'name': iteration, ...parsed }]);
          setOutputsAvg((prevOutpus: any)=> prevOutpus.filter((output:any)=> output.name != 1).map((output:any)=> ({...output, 'name': output.name <= 1 ? 1 : output.name - 1})).concat({ 'name': iteration, 'value': parseFloat(data.outgoing_traffic.toFixed(2)) }))
        } else {
          setCpus((prevCpus: any) => [...prevCpus, { 'name': iteration, ...parsed }])
          setOutputsAvg((prevOutpus: any)=> [...prevOutpus, { 'name': iteration, 'value':  parseFloat(data.outgoing_traffic.toFixed(2))}])
        }
        const usages = Object.keys(data.cpu_stats).reduce((acc: any, cpuKey: any) => {
          acc[cpuKey] = data.cpu_stats[cpuKey].map((cpu: any, index: number) => { return { usage: parseFloat(cpu.usage.toFixed(2)), 'name': index + 1 } });
          return acc;
        }, {})
        setCpusUsage(usages);
        const outputs = data.outputs.map((cpuKey: any, index:number) => {
          return { sent: parseFloat(cpuKey.sent.toFixed(2)), 'name': index + 1 }
        })
        setOutputs(outputs);
        setData(data)
      })
  }
  useEffect(() => {
    alternateLoadData(1);
  }, [])

  async function alternateLoadData(increment: number) {
    if(increment <= 12){
      setInteration(increment);
    }
    await loadData(increment);
    setTimeout(() => alternateLoadData(increment + 1), 5000);

  }

  useEffect(() => {
    const cpuKeys = Object.keys(cpus[0] || {}).filter((key) => key !== 'name');
    setCpusKey(cpuKeys);
  }
    , [cpus])
  return (
    <>
      <Head>
        <title>Lambda Dashboard</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <p>Monitoring Dashboard - joaodepollo</p>
      </header>
      <main>
        <div className='dashboard-container'>
          <div className='box-container'>
            <Box name='Cached Response' description='Percentage of response that had cached.' value={data.cached_percent} />
            <Box name='Outgoing Traffic' description='Response Size in relation to AVG' value={data.outgoing_traffic} />
            <Box name='Memory Usage' description='Virtual Memory Used' value={data.virtual_memory_used} />
            <Box name='Memory Available' description='Virtual Memory Available' value={data.virtual_memory_used ? 100 - data.virtual_memory_used : null} />
          </div>

          <div className='dashboard'>
            <p>CPUs AVG usage in last {`${interation == 12 ? "last minute" :  interation*5 + " seconds" }`} </p>
            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={cpus} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <Tooltip />
                <YAxis />
                <Legend />
                {cpuKeys.map((cpu: any, index: number) => {
                  return (
                    <Line
                      key={index + 1}
                      type="monotone"
                      dataKey={cpu}
                      stroke={lineColors[index]}
                      strokeWidth={2}
                    />
                  )
                }
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className='dashboard'>
            <p>Output traffic AVG  in last {`${interation == 12 ? "last minute" : interation * 5 + " seconds"}`} (in MB)</p>
            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={outputsAvg} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <Tooltip />
                <YAxis />
                <Legend />
                    <Line
                      type="monotone"
                      dataKey={"value"}
                      stroke={lineColors[0]}
                      strokeWidth={2}
                    />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className='dashboard'>
            <p>Outputs Sent in last minute(in MB)</p>
            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={outputs} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <Tooltip />
                <YAxis />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={"sent"}
                  stroke={lineColors[0]}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {Object.keys(cpusUsage).map((cpu: string, index: number) => {
            return <div className='dashboard' key={index}>

              <p>{cpu} usage in last minute</p>
              <ResponsiveContainer width="100%" height={300}>

                <LineChart className='dash' data={cpusUsage[cpu]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <Tooltip />
                  <YAxis />
                  <Legend />
                  <Line
                    key={index + 1}
                    type="monotone"
                    dataKey='usage'
                    stroke={lineColors[index]}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          })}
        </div>
      </main>
    </>
  )
}
