import net, { Socket } from 'net';
import { Observable, fromEvent, BehaviorSubject, Subject } from 'rxjs';

// handles socket connection for a single pipe
export class Pipe {
  public socket!: Socket;
  public is_connected$ = new BehaviorSubject(false);
  public errors$ = new Subject<Error>();
  public data$!: Observable<Buffer>;

  constructor(private path: string) {}

  connect() {
    this.socket = net.connect(this.path);
    this.socket.on('ready', () => this.is_connected$.next(true));
    this.socket.on('close', () => this.is_connected$.next(false));
    this.socket.on('error', err => {
      this.is_connected$.next(false);
      this.errors$.next(err);
    });
    this.data$ = fromEvent(this.socket, 'data');
  }

  disconnect() {
    if(this.socket) {
      this.socket.end();
      // 👇 dont think this is required
      // this.socket.removeAllListeners();
    }
  }
}
