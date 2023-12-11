import Head from 'next/head'
import Box from '@components/box'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { Id, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function Home() {


  const [cpus, setCpus] = useState<any>([]);
  const [cpuKeys, setCpusKey] = useState<any>([]);
  const [interation, setInteration] = useState<number>(1);

  const [cpusUsage, setCpusUsage] = useState<any>({});


  const lineColors = ['#8884d8', '#82ca9d', '#aa8437', '#ff7f0e', '#d62728', '#9467bd', '#8c564b',
    '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#1f77b4', '#aec7e8', '#ffbb78', '#98df8a', '#ff9896',
    '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5', '#aec7e8', '#ffbb78', '#98df8a'];
  const [data, setData] = useState<any>({});

  async function loadData(iteration: number) {

    await fetch('/api/redis')
      .then(response => {
        if (response.status == 200) return response.json();
        toast.error("Failed to load data", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true
        })
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
        if (iteration > 10) {
          iteration = 10;
          setCpus((prevCpus: any) => [...prevCpus.filter((cpu: any) => cpu.name != 1).map((cpu: any) => ({ ...cpu, 'name': cpu.name <= 1 ? 1 : cpu.name - 1 })), { 'name': iteration, ...parsed }]);
        } else {
          setCpus((prevCpus: any) => [...prevCpus, { 'name': iteration, ...parsed }])
        }

        const usages = Object.keys(data.cpu_stats).reduce((acc: any, cpuKey: any) => {
          acc[cpuKey] = data.cpu_stats[cpuKey].map((cpu: any, index: number) => { return { usage: parseFloat(cpu.usage.toFixed(2)), 'name': index + 1 } });
          return acc;
        }, {})
        setCpusUsage(usages);
        setData(data)
      })
  }
  useEffect(() => {
    alternateLoadData(1);
  }, [])

  async function alternateLoadData(increment: number) {
    if(increment <= 10){
      setInteration(increment);
    }
    const toastId = toast("Loading data", { isLoading: true, position: "top-right" })
    await loadData(increment);
    toast.dismiss(toastId);
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
            <Box name='Outgoing Traffic' description='Percentage of response in relation to request.' value={data.outgoing_traffic} />
            <Box name='Memory Usage' description='Vrtual Memory Used' value={data.virtual_memory_used} />
            <Box name='Memory Available' description='Vrtual Memory Available' value={data.virtual_memory_used ? 100 - data.virtual_memory_used : null} />
          </div>

          <div className='dashboard'>
            <p>CPUs AVG usage in last {interation*5} seconds</p>
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
          {Object.keys(cpusUsage).map((cpu: string, index: number) => {
            return <div className='dashboard'>

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
      <ToastContainer />
    </>
  )
}
