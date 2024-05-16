import React, { useState } from "react";
// refer to HomePageExplore
import { HomePageExplore } from "../../../data/homepage-explore";
import CourseCard from "./CourseCard";
import HighlightText from "./HighlightText";

const tabsName = [
  "Free",
  "New to coding",
  "Most popular",
  "Skills paths",
  "Career paths",
];

const ExploreMore = () => {
  // current tab btayega kis type k courses khule hai
  const [currentTab, setCurrentTab] = useState(tabsName[0]);
  // current tab k courses fetch kr rhe
  const [courses, setCourses] = useState(HomePageExplore[0].courses);
  // out of 3 cards , current card konsa h jispe click kiye hue h
  const [currentCard, setCurrentCard] = useState(HomePageExplore[0].courses[0].heading);

  // updates all three tab, course and card
  const setMyCards = (value) => {
    setCurrentTab(value);
    // filter on the basis of tag
    const result = HomePageExplore.filter((course) => course.tag === value);
    setCourses(result[0].courses);
    setCurrentCard(result[0].courses[0].heading);
  };

  return (
    <div>
      {/* Explore more section */}
      <div>
        <div className="text-4xl font-semibold text-center my-10">
          Unlock the
          <HighlightText text={"Power of Code"} />
          <p className="text-center text-richblack-300 text-lg font-semibold mt-1">
            Learn to Build Anything You Can Imagine
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="hidden lg:flex gap-5 -mt-5 mx-auto w-max bg-richblack-800 text-richblack-200 p-1 rounded-full font-medium drop-shadow-[0_1.5px_rgba(255,255,255,0.25)]">
      
      {
      // tabsName ki saari values ko populate krna tha 
      tabsName.map((ele, index) => {
          return (
            <div
              className={` text-[16px] flex flex-row items-center gap-2 ${
                currentTab === ele
                // selected text
                  ? "bg-richblack-900 text-richblack-5 font-medium"
                // else
                  : "text-richblack-200"
              } px-7 py-[7px] rounded-full transition-all duration-200 cursor-pointer hover:bg-richblack-900 hover:text-richblack-5`}
              key={index}
              // click krne pe setMyCards ko call kro
              onClick={() => setMyCards(ele)}
            >
              {ele}
            </div>
          );
        })}
      </div>

      {/* extra space add krne k liye */} 
      <div className="hidden lg:block lg:h-[200px]"></div>

      {/* course card ka group */}
      <div className="lg:absolute gap-10 justify-center lg:gap-0 flex lg:justify-between flex-wrap w-full lg:bottom-[0] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[50%] text-black lg:mb-0 mb-7 lg:px-0 px-3">
        {
        // jitni course ki values milegi utne cards create kro
        courses.map((ele, index) => {
          return (
            <CourseCard
              key={index}
              cardData={ele}
              currentCard={currentCard}
              setCurrentCard={setCurrentCard}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ExploreMore;