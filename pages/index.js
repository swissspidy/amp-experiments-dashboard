import Head from "next/head";

import { EXPERIMENTS } from "../lib/experiments-config";

function Description({ name }) {
  const experiment = EXPERIMENTS.find(({ id }) => id === name);

  if (!experiment) {
    return "";
  }

  return (
    <a
      href={experiment.spec}
      target="_blank"
      rel="noreferrer"
      className="hover:text-blue-600 focus:text-blue-600"
    >
      {experiment.name}
    </a>
  );
}

function Circle({ percentage }) {
  const p = 100 * percentage;
  const pFormatted = new Intl.NumberFormat("en-US", {
    style: "percent",
  }).format(percentage);
  return (
    <svg
      viewBox="0 0 33.83098862 33.83098862"
      width={100}
      height={100}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        stroke="#efefef"
        strokeWidth="2"
        fill="none"
        cx="16.91549431"
        cy="16.91549431"
        r="15.91549431"
      />
      <circle
        className="circle-chart-circle"
        stroke="#1C5FEC"
        strokeWidth="2"
        strokeDasharray={`${p},100`}
        strokeLinecap="round"
        fill="none"
        cx="16.91549431"
        cy="16.91549431"
        r="15.91549431"
      />
      <g>
        <text
          x="16.91549431"
          y="15.5"
          alignmentBaseline="central"
          textAnchor="middle"
          fontSize="8"
        >
          {pFormatted}
        </text>
      </g>
    </svg>
  );
}

function Table({ experiments }) {
  return (
    <table className="border-collapse table-auto w-full text-xl">
      <thead>
        <tr className="bg-gray-300 font-medium">
          <th className="border-b p-3 pl-5 text-gray-900 text-left">
            Experiment
          </th>
          <th className="border-b p-3 text-gray-900 text-left">Description</th>
          <th className="border-b p-3 pr-5 text-gray-900 text-right">
            Rollout
          </th>
        </tr>
      </thead>
      <tbody>
        {experiments.map(({ name, percentage }, i) => (
          <tr
            key={name}
            className={`border-b border-gray-100 p-4 pr-8 text-gray-500 ${
              i % 2 ? "bg-gray-100" : ""
            }`}
          >
            <td className="p-3 pl-5 text-left font-mono">{name}</td>
            <td className="p-3 text-left">
              <Description name={name} />
            </td>
            <td className="p-3 text-right items-right justify-right">
              <Circle percentage={percentage} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Home({ clientSideExperiments, prodExperiments }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>AMP Experiments Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">AMP Experiments Dashboard</h1>

        <div className="flex flex-wrap items-center justify-around max-w-7xl mt-6 sm:w-full">
          <div className="p-6 pl-0 mb-4 text-left w-full">
            <h2 className="text-2xl font-bold">Client-side Experiments</h2>
            <p className="mt-4 text-xl">
              <a
                href="https://raw.githubusercontent.com/ampproject/amphtml/main/build-system/global-configs/client-side-experiments-config.json"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 focus:text-blue-600"
              >
                Source &rarr;
              </a>
            </p>
          </div>

          <Table experiments={clientSideExperiments} />

          <div className="p-6 pl-0 mb-4 mt-10 text-left w-full">
            <h2 className="text-2xl font-bold">Prod Experiments</h2>
            <p className="mt-4 text-xl">
              <a
                href="https://raw.githubusercontent.com/ampproject/amphtml/main/build-system/global-configs/prod-config.json"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 focus:text-blue-600"
              >
                Source &rarr;
              </a>
            </p>
          </div>

          <Table experiments={prodExperiments} />
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps(context) {
  const clientSideExperiments = (
    await (
      await fetch(
        "https://raw.githubusercontent.com/ampproject/cdn-configuration/main/configs/client-side-experiments.json",
        {
          headers: { "Content-Type": "application/json" },
        }
      )
    ).json()
  ).experiments;

  const prodExperiments = await (
    await fetch(
      "https://raw.githubusercontent.com/ampproject/amphtml/main/build-system/global-configs/prod-config.json",
      {
        headers: { "Content-Type": "application/json" },
      }
    )
  ).json();

  const prodExperimentsFormatted = Object.entries(prodExperiments)
    .filter(([_, percentage]) => typeof percentage === "number")
    .map(([name, percentage]) => {
      return {
        name,
        percentage,
      };
    });

  return {
    props: {
      clientSideExperiments,
      prodExperiments: prodExperimentsFormatted,
    },
  };
}
