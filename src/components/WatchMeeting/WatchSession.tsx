import React, { useEffect, useRef, useState } from "react";
import user1 from "@/assets/images/user/user1.svg";
import user2 from "@/assets/images/user/user2.svg";
import user3 from "@/assets/images/user/user3.svg";
import user4 from "@/assets/images/user/user4.svg";
import user5 from "@/assets/images/user/user5.svg";
import user6 from "@/assets/images/user/user6.svg";
import user7 from "@/assets/images/user/user7.svg";
import user8 from "@/assets/images/user/user8.svg";
import user9 from "@/assets/images/user/user9.svg";
import view from "@/assets/images/daos/view.png";
import Image from "next/image";
import oplogo from "@/assets/images/daos/op.png";
import arblogo from "@/assets/images/daos/arbitrum.jpg";
import time from "@/assets/images/daos/time.png";
import onChain_link from "@/assets/images/watchmeeting/onChain_link.png";
import offChain_link from "@/assets/images/watchmeeting/offChain_link.png";
import { PiFlagFill } from "react-icons/pi";
import { BiSolidShare } from "react-icons/bi";
import { IoMdArrowDropdown } from "react-icons/io";
import Link from "next/link";
import VideoJS from "@/components/ComponentUtils/VideoJs";
import videojs from "video.js";
// import { parseISO } from "date-fns";
import ReportOptionModal from "./ReportOptionModal";
import { useRouter } from "next-nprogress-bar";
import "./WatchSession.module.css";
import ShareMediaModal from "./ShareMediaModal";
import { BASE_URL } from "@/config/constants";
import toast, { Toaster } from "react-hot-toast";
import { Tooltip } from "@nextui-org/react";
import { fetchEnsName } from "@/utils/ENSUtils";
import { IoMdEye } from "react-icons/io";
import {
  DynamicAttendeeInterface,
  SessionInterface,
} from "@/types/MeetingTypes";
import { UserProfileInterface } from "@/types/UserProfileTypes";
import { usePathname } from "next/navigation";
import { formatTimeAgo } from "@/utils/getRelativeTime";
import { daoConfigs } from "@/config/daos";
import styles from "./WatchSession.module.css"

interface Attendee extends DynamicAttendeeInterface {
  profileInfo: UserProfileInterface;
}

interface Meeting extends SessionInterface {
  attendees: Attendee[];
  views: any;
  hostProfileInfo: UserProfileInterface;
  startTime: string;
}

function WatchSession({
  data,
  collection,
  sessionDetails,
}: {
  data: Meeting;
  collection: string;
  sessionDetails: { title: string; description: string; image: string };
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [ensHostName, setEnsHostName] = useState<any>(null);
  const [shareModal, setShareModal] = useState(false);
  const router = useRouter();
  const path = usePathname();

  const userImages = [
    user1,
    user2,
    user3,
    user4,
    user5,
    user6,
    user7,
    user8,
    user9
  ];

  const getRandomUserImage = () => {
    const randomIndex = Math.floor(Math.random() * userImages.length);
    return userImages[randomIndex];
  };

  const handleShareClose = () => {
    setShareModal(false);
  };

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [data.description, isExpanded]);

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const getLineCount = (text: string) => {
    const lines = text.split("\n");
    return lines.length;
  };

  useEffect(() => {
    const fetchedEnsName = async () => {
      const name = await fetchEnsName(data.host_address.toLowerCase());
      setEnsHostName(name?.ensNameOrAddress);
    };

    fetchedEnsName();
  }, [data.host_address]);

  function formatViews(views: number): string {
    // Handle negative numbers or NaN
    if (isNaN(views) || views < 0) {
      return "0";
    }

    // For millions (e.g., 1.25M)
    if (views >= 1000000) {
      const millionViews = views / 1000000;
      return (
        millionViews.toFixed(millionViews >= 10 ? 0 : 1).replace(/\.0$/, "") +
        "M"
      );
    }
    // For thousands (e.g., 1.2k, 12k)
    if (views >= 1000) {
      const thousandViews = views / 1000;
      return (
        thousandViews.toFixed(thousandViews >= 10 ? 0 : 1).replace(/\.0$/, "") +
        "k"
      );
    }
    // For less than 1000 views, return as is
    return Math.floor(views).toString();
  }

  return (
    <div className="">
      <div className="rounded-3xl border border-[#CCCCCC] bg-blue-shade-500">
        <div
          className={`px-6 pt-4 pb-4 ${data.description.length > 0 ? "border-b" : ""
            }  border-[#CCCCCC]`}
        >
          <div className="text-lg font-semibold pb-3">
            {sessionDetails.title || data.title}
          </div>
          <div className="flex flex-col 2sm:flex-row justify-between text-[9px] 0.5xs:text-xs lg:text-base 1.5lg:text-sm 1.5xl:text-base pb-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2 ">
                <div
                  className="flex gap-2 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/user/${data.host_address}?active=info`
                    )
                  }
                >
                  <Image
                    src={
                      data.hostProfileInfo?.image
                        ? `https://gateway.lighthouse.storage/ipfs/${data.hostProfileInfo.image}`
                        : user2
                    }
                    alt="image"
                    width={200}
                    height={200}
                    className="w-5 h-5 rounded-full"
                    priority
                  />
                  <div className="text-[#dbdbdb] font-semibold hover:text-blue-shade-100">
                    {ensHostName}
                  </div>
                </div>
                <>
                  {data.uid_host ? (
                    <Tooltip
                      showArrow
                      content={
                        <div className="font-tektur">Offchain Attestation</div>
                      }
                      placement="top"
                      className="rounded-md bg-opacity-90 max-w-96 bg-gray-700"
                      closeDelay={1}
                    >
                      <Link
                        href={ `https://arbitrum.easscan.org/offchain/attestation/view/${data.uid_host}`
                          // data.uid_host
                          //   ? `${daoConfigs[data.dao_name.toLowerCase()]
                          //     .attestationUrl
                          //   }/${data.uid_host}`
                          //   : "#"
                        }
                        onClick={(e) => {
                          if (!data.uid_host) {
                            e.preventDefault();
                            toast.error("Offchain attestation not available");
                          }
                        }}
                        target="_blank"
                      >
                        <Image
                          src={offChain_link}
                          alt="image"
                          height={100}
                          width={100}
                          className="w-6 h-6"
                          priority
                          quality={100}
                        />
                      </Link>
                    </Tooltip>
                  ) : (
                    <></>
                  )}
                </>
                {data.onchain_host_uid ? (
                  <Tooltip
                    showArrow
                    content={
                      <div className="font-tektur">Onchain Attestation</div>
                    }
                    placement="top"
                    className="rounded-md bg-opacity-90 max-w-96 bg-gray-700"
                    closeDelay={1}
                  >
                    <Link
                      href={ `https://arbitrum.easscan.org/attestation/view/${data.onchain_host_uid}`
                        // data.onchain_host_uid
                        //   ? `${daoConfigs[data.dao_name.toLowerCase()]
                        //     .attestationUrl
                        //   }/${data.onchain_host_uid}`
                        //   : "#"
                      }
                      onClick={(e) => {
                        if (!data.onchain_host_uid) {
                          e.preventDefault();
                          toast.error("Onchain attestation not available");
                        }
                      }}
                      target="_blank"
                    >
                      <Image
                        alt="image"
                        src={onChain_link}
                        className="w-6 h-6"
                        quality={100}
                        width={100}
                        height={100}
                      />
                    </Link>
                  </Tooltip>
                ) : (
                  <></>
                )}
              </div>
            </div>

            <div className="flex gap-[10px]">
              <div className="flex items-center gap-1">
                <IoMdEye size={20} />
                <div className="text-[#dbdbdb]">
                  {formatViews(data?.views ?? 0)} views
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Image
                  src={time}
                  alt="image"
                  width={100}
                  height={100}
                  priority
                  className="w-5 h-5"
                />
                <div className="text-[#dbdbdb]">
                  {collection === "sessions"
                    ? formatTimeAgo(data.slot_time)
                    : collection === "office_hours"
                      ? formatTimeAgo(data.startTime)
                      : ""}
                </div>
              </div>
              {path.includes("/watch") && (
                <>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setModalOpen(true)}
                  >
                    <div>
                      <PiFlagFill color="#FF0000" size={20} />
                    </div>
                    <div className="text-[#FF0000]">Report</div>
                  </div>
                  <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => setShareModal(true)}
                  >
                    <div className="scale-x-[-1]">
                      <BiSolidShare size={20} />
                    </div>
                    <div className="text-[#dbdbdb]">Share</div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div>
            <div
              className="flex items-center border border-[#8E8E8E] bg-white w-fit rounded-md px-3 font-medium py-1 gap-2 cursor-pointer"
              onClick={() => setShowPopup(!showPopup)}
            >
              <div className="text-[#292929] text-sm">Guest</div>
              <div
                className={
                  showPopup
                    ? "rotate-180 duration-200 ease-in-out"
                    : "duration-200 ease-in-out"
                }
              >
                <IoMdArrowDropdown color="#4F4F4F" />
              </div>
            </div>
            {showPopup && (
              <div
                className={`absolute bg-white rounded-xl mt-1 py-2 duration-200 ease-in-out z-30 ${styles.customScrollbar}`}
                style={{ boxShadow: "0px 4px 9.1px 0px rgba(0,0,0,0.04)", maxHeight: "300px", overflowY: "auto" }}
              >
                {data.attendees.map((attendee, index) => (
                  <div key={index}>
                    <div className="flex items-center text-sm gap-3 px-6  py-[10px] justify-between">
                      <div className="flex gap-3">
                        <div>
                          <Image
                            src={
                              attendee.profileInfo?.image
                                ? `https://gateway.lighthouse.storage/ipfs/${attendee.profileInfo.image}`
                                : getRandomUserImage()
                            }
                            alt="image"
                            width={100}
                            height={100}
                            className="rounded-full h-5 w-5"
                            priority
                          />
                        </div>
                        <div>
                          {attendee.attendee_address.slice(0, 6) +
                            "..." +
                            attendee.attendee_address.slice(-4)}{" "}
                        </div>
                      </div>
                      {attendee.attendee_uid ? (
                        <Tooltip
                          showArrow
                          content={
                            <div className="font-tektur">
                              Offchain Attestation
                            </div>
                          }
                          placement="top"
                          className="rounded-md bg-opacity-90 max-w-96 bg-gray-700"
                          closeDelay={1}
                        >
                          <Link
                            href={ `https://arbitrum.easscan.org/offchain/attestation/view/${attendee.attendee_uid}`
                              // daoConfigs
                              //   ? `${daoConfigs[data.dao_name.toLowerCase()]
                              //     .attestationUrl
                              //   }/${attendee.attendee_uid}`
                              //   : ""
                            }
                            target="_blank"
                          >
                            <Image
                              src={offChain_link}
                              alt="image"
                              height={100}
                              width={100}
                              className="w-6 h-6"
                              priority
                              quality={100}
                            />
                          </Link>
                        </Tooltip>
                      ) : (
                        <></>
                      )}

                      {attendee.onchain_attendee_uid ? (
                        <Tooltip
                          showArrow
                          content={
                            <div className="font-tektur">
                              Onchain Attestation
                            </div>
                          }
                          placement="top"
                          className="rounded-md bg-opacity-90 max-w-96 bg-gray-700"
                          closeDelay={1}
                        >
                          <Link
                            href={
                              `https://arbitrum.easscan.org/attestation/view/${attendee.onchain_attendee_uid}`
                              // data.dao_name === "optimism" ||
                              // data.dao_name === "Optimism"
                              //   ? `https://optimism.easscan.org/attestation/view/${attendee.onchain_attendee_uid}`
                              //   : data.dao_name === "arbitrum" ||
                              //     data.dao_name === "Arbitrum"
                              //   ? `https://arbitrum.easscan.org/attestation/view/${attendee.onchain_attendee_uid}`
                              //   : ""
                            }
                            target="_blank"
                          >
                            <Image
                              alt="image"
                              src={onChain_link}
                              className="w-6 h-6"
                              width={100}
                              height={100}
                              priority
                              quality={100}
                            />
                          </Link>
                        </Tooltip>
                      ) : (
                        <></>
                      )}
                    </div>
                    {index !== data.attendees.length - 1 && (
                      <div className="border border-[#D9D9D9]"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {sessionDetails.description.length > 0 ? (
          <div
            className={`px-6 pt-4 pb-4 rounded-b-3xl bg-[#212c4c] text-[#bebebe]`}
          >
            {sessionDetails.description}
          </div>
        ) : (
          data.description.length > 0 && (
            <div
              className={`px-6 pt-4 pb-4 rounded-b-3xl bg-[#212c4c] text-[#bebebe]`}
            >
              <>
                <div
                  ref={contentRef}
                  className={`max-h-full transition-max-height duration-500 ease-in-out overflow-hidden ${isExpanded ? "max-h-full" : "max-h-24 line-clamp-3"
                    }`}
                  style={{
                    maxHeight: isExpanded ? `${contentHeight}px` : "6rem",
                  }}
                >
                  <div className="overflow-hidden">{data.description}</div>
                </div>

                {getLineCount(data.description) > 3 && (
                  <button
                    className="text-sm text-blue-shade-200 mt-2"
                    onClick={toggleExpansion}
                  >
                    {isExpanded ? "View Less" : "View More"}
                  </button>
                )}
              </>
            </div>
          )
        )}
      </div>

      {modalOpen && (
        <ReportOptionModal
          data={data}
          collection={collection}
          isOpen={modalOpen}
          onClose={handleModalClose}
        />
      )}

      {shareModal && (
        <ShareMediaModal
          isOpen={shareModal}
          onClose={handleShareClose}
          data={data}
        />
      )}
    </div>
  );
}

export default WatchSession;
