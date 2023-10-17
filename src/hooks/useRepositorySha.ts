import useLekkoClient, { lekkoClient } from "./useLekkoClient"
import {  type Client } from "js-sdk"
import { useEffect, useMemo, useState } from "react"

export const REPOSITORY_SHA_KEY = 'Lekko_Repository_Sha'

const REACT_QUERY_CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE'

interface Resource<T> {
    fetch: () => T;
  }
  
  function createSuspensefulResource2<T>(promise: Promise<T>): Resource<T> {
    let status: 'pending' | 'success' | 'error' = 'pending';
    let result: T | undefined;
    let error: any;
  
    promise.then(
        (resolved) => {
            status = 'success';
            result = resolved;
        },
        (err) => {
            status = 'error';
            error = err;
        }
    );
  
    return {
        fetch() {
            if (status === 'pending') throw promise;
            if (status === 'error') throw error;
            if (status === 'success' && result !== undefined) return result;
            throw new Error("Unable to fetch");
        },
    };
  };

  function createSuspensefulResource<T>(init: () => Promise<T>): Resource<T> {
    return {
      fetch() {
        const promise = init();
        let status: 'pending' | 'success' | 'error' = 'pending';
        let result: T | undefined;
        let error: any;
  
        promise.then(
          (resolved) => {
            status = 'success';
            result = resolved;
          },
          (err) => {
            status = 'error';
            error = err;
          }
        );
  
        if (status === 'pending') throw promise;
        if (status === 'error') throw error;
        if (status === 'success' && result !== undefined) return result;
        throw new Error("Unable to fetch");
      },
    };
  }
  

  async function getAndCheckRepoSha(client: Client) {
    const existingSha = localStorage.getItem(REPOSITORY_SHA_KEY)
    const sha = await client.getRepoSha();
    if (existingSha !== undefined && sha !== existingSha) {
        localStorage.removeItem(REACT_QUERY_CACHE_KEY)
    }
    localStorage.setItem(REPOSITORY_SHA_KEY, sha);
    return sha
  }

  /*function createRepoShaResource(client: Client): Resource<string> {
    const promise = getAndCheckRepoSha(client);
    const resource = createSuspensefulResource(promise);
    return resource;
}*/

export function useRepositorySha2() {
    const client = useLekkoClient();
  
    const repoShaResource = useMemo(() => 
      createSuspensefulResource(() => getAndCheckRepoSha(client)), 
      [client]
    );
  
    return repoShaResource.fetch();
  }

  let result: any

  export function useRepositorySha5() {
    const client = useLekkoClient()
    let fetching = client.getRepoSha()
      .then((success) => {
        status = "fulfilled";
  
        result = success;
      })
      // Fetch request has failed
      .catch((error) => {
        status = "rejected";
  
        result = error;
      });
  
    return () => {
      if (status === "pending") {
        throw fetching; // Suspend(A way to tell React data is still fetching)
      } else if (status === "rejected") {
        throw result; // Result is an error
      } else if (status === "fulfilled") {
        return result; // Result is a fulfilled promise
      }
    };
  }
  


export default function useRepositorySha() {
    console.log('using')
  //const client = useMemo(() => useLekkoClient(), []);
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    lekkoClient.getRepoSha()
      .then(setData)
      .catch(setError);
  }, [lekkoClient]);

  if (error) throw error; // This will propagate the error to an error boundary
  if (!data) throw Promise.resolve(); // Suspend here

  return data;
}



  export function useRepositorySha3() {
    const client = useLekkoClient();
  
    const [repoSha, setRepoSha] = useState<string | null>(null);
    const [error, setError] = useState<any>(null);
  
    useEffect(() => {
      console.log("useEffect is running"); // Log to check if useEffect is being called
  
      let active = true;
  
      (async () => {
        console.log("Fetching data"); // Log to check if the fetching starts
        try {
          const sha = await getAndCheckRepoSha(client);
          console.log("Data fetched:", sha); // Log the fetched data
          if (active) {
            setRepoSha(sha);
          }
        } catch (err) {
          console.error("Fetching error:", err); // Log any error during fetching
          if (active) {
            setError(err);
          }
        }
      })();
  
      return () => {
        active = false;
      };
    }, [client]);
  
    if (repoSha === null && error === null) {
      throw new Promise((resolve) => {
        if (repoSha !== null) {
          resolve(repoSha);
        }
      });
    }
  
    if (error !== null) {
      throw error;
    }
  
    return repoSha;
  }
  