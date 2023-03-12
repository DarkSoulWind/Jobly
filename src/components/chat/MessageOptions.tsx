import { Menu, Transition } from "@headlessui/react";
import { FC, Fragment, HTMLAttributes } from "react";
import { HiEllipsisHorizontal, HiFlag, HiTrash } from "react-icons/hi2";

interface MessageOptionsProps extends HTMLAttributes<HTMLDivElement> {
  isReceiver: boolean;
  message: string;
  unsend: () => void;
}

const MessageOptions: FC<MessageOptionsProps> = (props) => {
  return (
    <Menu>
      <Menu.Button className="relative group p-2 rounded-full aspect-square hover:bg-slate-100 transition-all">
        <HiEllipsisHorizontal />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute mt-1 w-56 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none top-0 ${
            props.isReceiver ? "right-7" : "left-7"
          }`}
        >
          <div className="p-1">
            {props.isReceiver && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={props.unsend}
                    className={`${
                      active ? "bg-violet-500 text-white" : "text-gray-900"
                    } group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
                  >
                    <HiTrash
                      className={`w-5 h-5 ${
                        active ? "fill-white" : "fill-red-500"
                      }`}
                    />
                    <p
                      className={`font-bold ${
                        active ? "text-white" : "text-red-500 "
                      }`}
                    >
                      Delete
                    </p>
                  </button>
                )}
              </Menu.Item>
            )}

            {!props.isReceiver && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "bg-violet-500 text-white" : "text-gray-900"
                    } group flex gap-2 w-full items-center transition-all duration-300 rounded-md px-2 py-2 text-sm`}
                  >
                    <HiFlag className="w-5 h-5" />
                    <p className={`font-bold`}>Report</p>
                  </button>
                )}
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default MessageOptions;
