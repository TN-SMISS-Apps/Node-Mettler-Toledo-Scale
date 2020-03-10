
// input_socket: Socket;
// output_socket: Socket;
// connectionState$ = new BehaviorSubject(false);
// constructor() {
//   this.initPipes();
//   // this.output_socket
//   // this.input_socket.
// }
// initPipes() {
//   this.output_socket = net.connect(OUT_PIPE_PATH);
//   this.input_socket = net.connect(IN_PIPE_PATH);
// }

// client.on('data', (data) => {
//   console.log(data);
// //  console.log(Buffer.from([0x15]))
//   console.log(data.toString())
// //  console.log(data == Buffer.from([0x15]))
// });

// client.on('end', () => {
//   console.log('disconnected from server');
// });

// const sendRequestForScaleData = () => {
//   clientW.write(Buffer.from([0x04, 0x05]))
// }

// sendRequestForScaleData();


    // return Promise.resolve(
    //   Buffer.from([
    //     0x02,
    //     0x30,
    //     0x32,
    //     0x1b,
    //     0x33,
    //     0x1b,
    //     0x30,
    //     0x30,
    //     0x34,
    //     0x37,
    //     0x36,
    //     0x1b,
    //     0x30,
    //     0x30,
    //     0x30,
    //     0x30,
    //     0x30,
    //     0x30,
    //     0x1b,
    //     0x30,
    //     0x30,
    //     0x30,
    //     0x30,
    //     0x30,
    //     0x30,
    //     0x03,
    //   ]),
    // );