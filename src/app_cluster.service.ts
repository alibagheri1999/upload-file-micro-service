import * as _cluster from 'cluster';
import * as os from 'os';
import { Injectable } from '@nestjs/common';

const numCPUs: number = os.cpus().length;

@Injectable()
export class AppClusterService {
    static clusterize(callback: Function): void {
        const cluster = _cluster as unknown as _cluster.Cluster;
        if(cluster.isMaster){
            console.log(`Master server started on ${process.pid}`);
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }
            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died. Restarting`);
                cluster.fork();
            })
        } else {
            console.log(`Cluster server started on ${process.pid}`)
            callback();
        }
    }
}