import React, { Suspense, useState } from 'react'
import { LekkoConfigProvider } from '../providers/lekkoConfigProvider';
import { EvaluationType, LekkoConfig } from '../utils/types';
import { ClientContext, useLekkoConfig, useLekkoConfigDLE, useLekkoConfigFetch } from '..';
import { LekkoPersistedConfigProvider } from '../providers/lekkoPersistedConfigProvider';

const sampleEvaluation = {
    namespaceName: 'default',
    configName: 'example',
    evaluationType: EvaluationType.BOOL,
    //context: new ClientContext().setInt("age", 34)
    context: new ClientContext().setInt("organization_id", 3).setString("state", "texas")
  }
  
  const sampleEvaluation2 = {
    namespaceName: 'default',
    configName: 'example',
    evaluationType: EvaluationType.BOOL,
    context: new ClientContext().setInt("organization_id", 4)
  }
  
  interface DisplayProps {
    config: LekkoConfig
    title: string
  }
  
  function Evaluation({
    config,
    title
  }: DisplayProps) {
    /*const { evaluation, isEvaluationLoading } = useLekkoConfigDLE(config)

    if (isEvaluationLoading) {
        return <></>
    }*/
    //console.log(e)
    const evaluation = useLekkoConfig(config)
    console.log(evaluation)
  
    return (
      <div>
        <LekkoConfigDisplay config={sampleEvaluation} result={evaluation} title={title} />
      </div>
    )
  }
  
  
  interface LekkoConfigDisplayProps {
    config: LekkoConfig
    result: any
    title: string
  }
  
  export const LekkoConfigDisplay: React.FC<LekkoConfigDisplayProps> = ({ title, config, result }) => {
    return (
      <div className="p-8 bg-white shadow-md rounded-lg flex flex-col items-start">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="mb-2">
          <strong>Namespace Name:</strong> {config.namespaceName}
        </div>
        <div className="mb-2">
          <strong>Config Name:</strong> {config.configName}
        </div>
        <div className="mb-2">
          <strong>Evaluation Type:</strong> {config.evaluationType}
        </div>
        <div className="mb-2">
          <strong>Context:</strong>
          <div className="bg-gray-100 p-2 rounded">{JSON.stringify(config?.context?.data, null, 2)}</div>
        </div>
        <div className="mb-2">
          <strong>Result:</strong>
          <div className="bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</div>
        </div>
      </div>
    );
  };
  
  interface Props {
    config: LekkoConfig;
  }
  
  enum ContextType {
    INT = 'int',
    STRING = 'string',
    BOOL = 'bool',
    DOUBLE = 'double'
  }
  
  interface Pair {
    key: string
    type: ContextType;
    value: string;
  }
  
  const EditableConfig: React.FC<Props> = ({ config }) => {
    const [editedConfig, setEditedConfig] = useState<LekkoConfig>(config)
    const [pairs, setPairs] = useState<Pair[]>([{ key: '', type: ContextType.STRING, value: '' }]);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false)
  
    const handleTypeChange = (index: number, type: ContextType) => {
      const newPairs = [...pairs];
      newPairs[index] = {
        ...newPairs[index],
        type
      }
      setPairs(newPairs);
    };
  
    const handleValueChange = (index: number, value: string) => {
      const newPairs = [...pairs];
      newPairs[index] = {
        ...newPairs[index],
        value
      }
      setPairs(newPairs);
    };
  
    const handleKeyChange = (index: number, key: string) => {
      const newPairs = [...pairs];
      newPairs[index] = {
        ...newPairs[index],
        key
      }
      setPairs(newPairs);
    };
  
    const addPair = () => {
      setPairs([...pairs, { key: '', type: ContextType.STRING, value: '' }]);
    };
  
    const removePair = (index: number) => {
      const newPairs = [...pairs];
      newPairs.splice(index, 1);
      setPairs(newPairs);
    };
  
    const fetch = useLekkoConfigFetch()
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedConfig({
        ...editedConfig,
        [e.target.name]: e.target.value,
      });
    };
  
    const handleEvaluate = async () => {
      setLoading(true)
      const context = new ClientContext()
      pairs.forEach(pair => {
        if (pair.type === ContextType.BOOL) {
          context.setBoolean(pair.key, pair.value === "true")
        } else if (pair.type === ContextType.DOUBLE) {
          context.setDouble(pair.key, parseFloat(pair.value))
        } else if (pair.type === ContextType.INT) {
          context.setInt(pair.key, parseInt(pair.value))
        } else if (pair.type === ContextType.STRING) {
          context.setString(pair.key, pair.value)
        }
      })
      const evaluationResult = await fetch({
        ...editedConfig,
        context
      });
      setLoading(false)
      setResult(evaluationResult);
    };
  
    return (
      <div className="p-8 bg-white shadow-md rounded-lg flex flex-col items-start">
        <h2 className="text-xl font-semibold mb-4">Edit Lekko Config</h2>
        <div className="mb-2">
          <label>
            <strong>Namespace Name:</strong>
            <input
              className="border ml-2 p-1"
              name="namespaceName"
              value={editedConfig.namespaceName}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <div className="mb-2">
          <label>
            <strong>Config Name:</strong>
            <input
              className="border ml-2 p-1"
              name="configName"
              value={editedConfig.configName}
              onChange={handleInputChange}
            />
          </label>
        </div>
  
        {pairs.map((pair, index) => (
          <div key={index} className="mb-4 flex gap-2 items-center">
            <label>key</label>
            <input
              className="border p-1"
              value={pair.key}
              onChange={(e) => handleKeyChange(index, e.target.value)}
            />
            <label>type</label>
            <select
              className="border p-1 mr-2"
              value={pair.type}
              onChange={(e) => handleTypeChange(index, e.target.value as ContextType)}
            >
              {Object.values(ContextType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <label>value</label>
            <input
              className="border p-1"
              value={pair.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
            />
            <button className="ml-2 p-1 bg-red-600 text-white rounded" onClick={() => removePair(index)}>
              Remove
            </button>
          </div>
        ))}
  
        <button className="mb-4 p-2 bg-green-600 text-white rounded" onClick={addPair}>
          Add Pair
        </button>
  
        <button className="mt-4 p-2 bg-blue-600 text-white rounded" onClick={handleEvaluate}>
          Evaluate
        </button>
  
        {result && !loading && (
          <div className="mt-4">
            <strong>Result:</strong>
            <div className="bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</div>
          </div>
        )}
        {loading && <div className='mt-4'>Fetching evaluation result...</div>}
      </div>
    );
  };


export default function App() {
    const [show, setShow] = useState<boolean>(false)
    return (
      <div className="App flex flex-col items-start">
          <Suspense fallback={<div className='p-3'>Loading Lekko SDK Provider...</div>}>
            <LekkoPersistedConfigProvider configRequests={[sampleEvaluation]}>
                <div className='mb-5'>
                    <Suspense fallback={<div className='mt-4'>Loading inner suspense component...</div>}>
                        <Evaluation config={sampleEvaluation} title="Preloaded provider evaluation" />
                    </Suspense>
                </div>
                <EditableConfig config={sampleEvaluation2} />
                {show && <div>
                  <Suspense fallback={<div className='mt-4'>Loading inner suspense component...</div>}>
                    <Evaluation config={sampleEvaluation2} title="Suspenseful inner component evaluation" />
                  </Suspense>
                </div>}
                <div className='flex flex-col items-start p-3 mt-4'>
                    <button className="p-2 bg-blue-600 text-white rounded" onClick={() => setShow(s => !s)}>{show ? "Hide inner component" : "Show inner component"}</button>
                </div>
            </LekkoPersistedConfigProvider>
          </Suspense>
      </div>
    );
  }