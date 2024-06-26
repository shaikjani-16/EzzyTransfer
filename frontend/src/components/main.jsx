import { useRecoilValue } from "recoil";
import { Balance } from "./Balance";
import { Users } from "./users";
import { nameAtom } from "../store/atom";

export const Appbar = () => {
  const name = useRecoilValue(nameAtom);
  return (
    <>
      <div className="shadow h-14 flex justify-between">
        <div className="flex flex-col justify-center h-full ml-4">
          EzzyTransfer
        </div>
        <div className="flex">
          <div className="flex flex-col justify-center h-full mr-4">Hello</div>
          <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
            <div className="flex flex-col justify-center h-full text-xl">
              {name}
            </div>
          </div>
        </div>
      </div>
      <Balance />
      <Users />
    </>
  );
};
