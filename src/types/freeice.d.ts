declare module "freeice" {
  interface IceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
  }

  export default function freeice(): IceServer[];
}
