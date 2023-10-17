import useLekkoClient from "./useLekkoClient"
import {  type Client } from "js-sdk"
import { useEffect, useMemo, useRef, useState } from "react"

export const REPOSITORY_SHA_KEY = 'Lekko_Repository_Sha'

const REACT_QUERY_CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE'

interface Resource<T> {
    fetch: () => T;
  }
  
  function createSuspensefulResource<T>(promise: Promise<T>): Resource<T> {
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

  async function getAndCheckRepoSha(client: Client) {
    const existingSha = localStorage.getItem(REPOSITORY_SHA_KEY)
    const sha = await client.getRepoSha();
    if (existingSha !== undefined && sha !== existingSha) {
        localStorage.removeItem(REACT_QUERY_CACHE_KEY)
    }
    localStorage.setItem(REPOSITORY_SHA_KEY, sha);
    return sha
  }

  function createRepoShaResource(client: Client): Resource<string> {
    const promise = getAndCheckRepoSha(client);
    const resource = createSuspensefulResource(promise);
    return resource;
}

/*export default function useRepositorySha() {
    const client = useLekkoClient();

    // Create the promise only once and store it in a ref
    const promiseRef = useRef<Promise<string> | null>(null);
    if (!promiseRef.current) {
        promiseRef.current = getAndCheckRepoSha(client);
    }

    // This resource will handle the suspense, throwing the promise
    // and managing the result or error
    const resource = useMemo(() => {
        return createSuspensefulResource(promiseRef.current!);
    }, [promiseRef.current]);

    // Directly fetch the result, throwing the promise to the Suspense boundary
    return resource.fetch();
}*/



const fetchData = async (client: Client) => {
    const sha = await client.getRepoSha();
    return sha;
  };

  interface Resource<T> {
    read: () => T;
}

function createResource<T>(promise: Promise<T>): Resource<T> {
    let status: 'pending' | 'success' | 'error' = 'pending';
    let result: T;
    let error: any;

    promise.then(
        resolved => {
            status = 'success';
            result = resolved;
        },
        err => {
            status = 'error';
            error = err;
        }
    );

    return {
        read() {
            if (status === 'pending') throw promise;
            if (status === 'error') throw error;
            if (status === 'success') return result;
        },
    };
}

async function getRepoSha(client: Client) {
    return client.getRepoSha(); // Assuming this returns a promise
}

export default function useRepositorySha(client: Client): string {
    const resource = useMemo(() => createResource(getRepoSha(client)), [client]);
    return resource.read();
}
