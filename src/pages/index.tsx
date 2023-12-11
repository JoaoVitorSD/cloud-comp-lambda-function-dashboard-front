import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import Box from '@components/box'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { RedisData } from '@types';
import { useEffect, useState } from 'react';
import { cp } from 'fs';
import { cpuUsage } from 'process';
export default function Home() {


  const [cpus, setCpus] = useState<any>([]);
  const [cpuKeys, setCpusKey] = useState<any>([]);
  let iteration = 1;

  const [cpusUsage, setCpusUsage] = useState<any>({});


  const lineColors = ['#8884d8', '#82ca9d', '#aa8437', '#ff7f0e', '#d62728', '#9467bd', '#8c564b',
    '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#1f77b4', '#aec7e8', '#ffbb78', '#98df8a', '#ff9896',];
  const [data, setData] = useState<any>({});

  function loadData(iteration: number) {
    fetch('/api/redis')
      .then(response => {
        if (response.status == 200) return response.json();
        alert("Failed to load data")
        throw new Error('Failed to load data');
      })
      .then((data: any) => {
        const parsed = data.cpus_avg.reduce((acc: any, cpu: any) => {
          const keys = Object.keys(cpu);
          const key = `${keys[0]}`;
          acc[key] = parseFloat(cpu[key].toFixed(2));
          return acc;
        }, {});
        if (iteration > 10) {
          iteration = 10;
          setCpus((prevCpus: any) => [...prevCpus.filter((cpu: any) => cpu.name != 1).map((cpu: any) => ({ ...cpu, 'name': cpu.name <= 1 ? 1 : cpu.name - 1 })), { 'name': iteration, ...parsed }]);
        } else {
          setCpus((prevCpus: any) => [...prevCpus, { 'name': iteration, ...parsed }])
        }

        debugger;
        const usages = Object.keys(data.cpu_stats).reduce((acc: any, cpuKey: any) => {
          acc[cpuKey] = data.cpu_stats[cpuKey].map((cpu: any, index: number) => { return { usage: parseFloat(cpu.usage.toFixed(2)), 'name': index + 1 } });
          return acc;
        }, {})
        console.log(usages)
        setCpusUsage(usages);
        setData(data)
      })
  }
  useEffect(() => {
    loadData(1);
    const inverval = setInterval(() => loadData(++iteration), 1000);

    return () => clearInterval(inverval);
  }, [])

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
            <Box name='Outgoing Traffic' description='Percentage of response in relation to request.' value={data.outgoing_traffic} />
            <Box name='Memory Usage' description='Vrtual Memory Used' value={data.virtual_memory_used} />
            <Box name='Memory Available' description='Vrtual Memory Available' value={100 - data.virtual_memory_used} />
          </div>

          <div className='dashboard'>
            <p>CPUs AVG usage in last 10 seconds</p>
            <LineChart width={600} height={300} data={cpus} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
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
          </div>

          {Object.keys(cpusUsage).map((cpu: string, index: number) => {

            return <div className='dashboard'>
              <p>{cpu} usage in last minute</p>
              <LineChart className='dash' width={600} height={300} data={cpusUsage[cpu]} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
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
            </div>
          })}
        </div>
      </main>
    </>
  )
}
