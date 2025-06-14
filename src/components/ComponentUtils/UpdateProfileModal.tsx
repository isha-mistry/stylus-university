import React, { useEffect, useState } from "react";
import Image from "next/image";
import { BsDiscord } from "react-icons/bs";
import { CgAttachment } from "react-icons/cg";
import { FaUserEdit } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { SiDiscourse } from "react-icons/si";
import { TbBrandGithubFilled, TbMailFilled } from "react-icons/tb";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip, } from "@nextui-org/react";
import { RiTelegram2Fill } from "react-icons/ri";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: {
    displayName: string;
    emailId: string;
    twitter: string;
    telegram: string;
    discord: string;
    github: string;
    displayImage: string;
  };
  handleInputChange: (field: string, value: string) => void;
  uploadImage: (files: FileList | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
  handleSave: () => void;
  handleToggle: () => void;
  isToggled: boolean;
}

function UpdateProfileModal({
  isOpen,
  onClose,
  modalData,
  handleInputChange,
  uploadImage,
  fileInputRef,
  isLoading,
  handleSave,
  handleToggle,
  isToggled,
}: ProfileModalProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mediaQuery = window.matchMedia("(max-width: 640px)");
      setIsMobile(mediaQuery.matches);
    };

    checkIsMobile(); // Check initially
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);
  return (
    <div onClick={onClose}>
      <Modal
        onClick={(event) => {
          event.stopPropagation();
        }}
        isOpen={isOpen}
        className="font-tektur rounded-3xl max-h-[90vh] overflow-hidden bg-gray-800"
        size={isMobile ? "full" : "2xl"}
        hideCloseButton
      >
        <ModalContent className="flex flex-col h-full bg-gray-800">
          <>
            <ModalHeader className="flex justify-between text-2xl font-semibold items-center bg-blue-600 text-white px-8 py-6 ">
              Update your Profile
              <button
                onClick={onClose}
                className="text-blue-600 bg-white w-5 h-5  rounded-full flex items-center justify-center font-semibold text-xl hover:bg-gray-100 transition-colors"
              >
                <IoClose className="font-bold size-4" />
              </button>
            </ModalHeader>
            <ModalBody className="px-4 xm:px-10 pb-4 pt-6 overflow-y-auto flex-grow bg-gray-800">
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2 text-gray-200">
                  Upload Profile Image:
                </div>
                <div className="flex items-center">
                  <div className="w-24 h-24 bg-gray-700 rounded-md flex items-center justify-center mr-2 xm:mr-4">
                    {modalData.displayImage ? (
                      <Image
                        src={`https://gateway.lighthouse.storage/ipfs/${modalData.displayImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-md"
                        width={100}
                        height={100}
                        priority={true}
                      />
                    ) : (
                      <div className="text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs xs:text-sm text-gray-400 mb-2">
                      Please upload square image, size less than 100KB
                    </p>
                    <div className="flex items-center">
                      <label className="bg-gray-700 text-blue-400 font-medium text-sm p-2 xs:py-3 xs:px-4 rounded-full border cursor-pointer border-blue-400 hover:bg-gray-600 transition-colors flex gap-2 items-center">
                        <CgAttachment />
                        <span>Choose File</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => uploadImage(e.target.files)}
                          className="hidden"
                        />
                      </label>
                      <span className="ml-1.5 xs:ml-3 text-xs xs:text-sm text-gray-400">
                        {fileInputRef.current?.files?.[0]?.name ||
                          "No File Chosen"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex">
                <div className="flex flex-col mt-1.5 w-full">
                  <div className="font-semibold text-sm flex px-3 items-center gap-1.5 text-gray-200">
                    <FaUserEdit /> Display name:
                  </div>
                  <input
                    type="text"
                    value={modalData.displayName}
                    placeholder="Enter Name"
                    className="border border-gray-600 mt-1 bg-gray-700 rounded-lg px-3 py-[10px] text-sm text-gray-200 font-normal placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                    onChange={(e) =>
                      handleInputChange("displayName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 xm:gap-6 flex-col xm:flex-row">
                <div className="flex flex-col basis-1/2 mt-1.5">
                  <div className="text-sm font-semibold flex px-3 items-center gap-1.5 text-gray-200">
                    <FaXTwitter />
                    (Formerly Twitter):
                  </div>
                  <input
                    type="url"
                    value={modalData.twitter}
                    placeholder="Enter Twitter Name"
                    className="border border-gray-600 mt-1 bg-gray-700 rounded-lg px-3 py-[10px] text-sm text-gray-200 font-normal placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                    onChange={(e) =>
                      handleInputChange("twitter", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col basis-1/2 mt-1.5">
                  <div className="text-sm font-semibold flex px-3 items-center gap-1.5 text-gray-200">
                    <RiTelegram2Fill />
                    Telegram:
                  </div>
                  <input
                    type="url"
                    value={modalData.telegram}
                    placeholder="Enter Discourse Name"
                    className="border border-gray-600 mt-1 bg-gray-700 rounded-lg px-3 py-[10px] text-sm text-gray-200 font-normal placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                    onChange={(e) =>
                      handleInputChange("telegram", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 xm:gap-6 flex-col xm:flex-row">
                <div className="flex flex-col basis-1/2 mt-1.5">
                  <div className="text-sm font-semibold flex px-3 items-center gap-1.5 text-gray-200">
                    <BsDiscord />
                    Discord:
                  </div>
                  <input
                    type="url"
                    value={modalData.discord}
                    placeholder="Enter Discord Name"
                    className="border border-gray-600 mt-1 bg-gray-700 rounded-lg px-3 py-[10px] text-sm text-gray-200 font-normal placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                    onChange={(e) =>
                      handleInputChange("discord", e.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col basis-1/2 mt-1.5">
                  <div className="text-sm font-semibold flex px-3 items-center gap-1.5 text-gray-200">
                    <TbBrandGithubFilled />
                    Github:
                  </div>
                  <input
                    type="url"
                    value={modalData.github}
                    placeholder="Enter Github Name"
                    className="border border-gray-600 mt-1 bg-gray-700 rounded-lg px-3 py-[10px] text-sm text-gray-200 font-normal placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                    onChange={(e) =>
                      handleInputChange("github", e.target.value)
                    }
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center items-center bg-gray-800">
              <Button
                className="bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-semibold text-white px-10 mt-3 mb-7 transition-colors"
                onPress={() => handleSave()}
              >
                {isLoading ? "Saving" : "Save"}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default UpdateProfileModal;