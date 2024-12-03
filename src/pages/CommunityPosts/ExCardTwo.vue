<html>
  <head>
    <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="" />
    <link
      rel="stylesheet"
      as="style"
      onload="this.rel='stylesheet'"
      href="https://fonts.googleapis.com/css2?display=swap&amp;family=Noto+Sans%3Awght%40400%3B500%3B700%3B900&amp;family=Plus+Jakarta+Sans%3Awght%40400%3B500%3B700%3B800"
    />

    <title>Galileo Design</title>
    <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64," />

    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  </head>
  <body>
    <div
      class="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
      style='font-family: "Plus Jakarta Sans", "Noto Sans", sans-serif;'
    >
      <div>
        <div class="flex items-center bg-white p-4 pb-2 justify-between">
          <div class="text-[#111418] flex size-12 shrink-0 items-center" data-icon="X" data-size="24px" data-weight="regular">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path
                d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
              ></path>
            </svg>
          </div>
          <h2 class="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Start post</h2>
          <div class="flex w-12 items-center justify-end"><p class="text-[#637588] text-base font-bold leading-normal tracking-[0.015em] shrink-0">Post</p></div>
        </div>
        <div class="flex items-center px-4 py-3 gap-3 @container h-full max-h-[520px]">
          <label class="flex flex-col min-w-40 h-full flex-1">
            <div class="flex w-full flex-1 items-stretch rounded-xl flex-col">
              <div class="flex border border-[#dce0e5] bg-white item-center pl-[15px] pr-[15px] pt-[15px] rounded-t-xl border-b-0">
                <div
                  class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0"
                  style='background-image: url("https://cdn.usegalileo.ai/stability/734ca34f-0657-4004-972c-3a953044255a.png");'
                ></div>
              </div>
              <textarea
                placeholder="What do you want to talk about?"
                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] min-h-36 placeholder:text-[#bbc4ce] p-[15px] rounded-t-none border-t-0 text-base font-normal leading-normal pt-4 pb-0"
              ></textarea>
            </div>
          </label>
        </div>
      </div>
      <div>
        <div class="flex absolute top-0 left-0 h-full w-full flex-col justify-end items-stretch">
          <div class="flex flex-col items-stretch bg-white">
            <button class="flex h-5 w-full items-center justify-center"><div class="h-1 w-9 rounded-full bg-[#dce0e5]"></div></button>
            <div class="flex-1">
              <div class="flex items-center gap-4 bg-white px-4 min-h-14">
                <div class="text-[#111418] flex items-center justify-center rounded-lg bg-[#f0f2f4] shrink-0 size-10" data-icon="Image" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z"
                    ></path>
                  </svg>
                </div>
                <p class="text-[#111418] text-base font-normal leading-normal flex-1 truncate">Add a photo</p>
              </div>
              <div class="flex items-center gap-4 bg-white px-4 min-h-14">
                <div
                  class="text-[#111418] flex items-center justify-center rounded-lg bg-[#f0f2f4] shrink-0 size-10"
                  data-icon="VideoCamera"
                  data-size="24px"
                  data-weight="regular"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M251.77,73a8,8,0,0,0-8.21.39L208,97.05V72a16,16,0,0,0-16-16H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V159l35.56,23.71A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73ZM192,184H32V72H192V184Zm48-22.95-32-21.33V116.28L240,95Z"
                    ></path>
                  </svg>
                </div>
                <p class="text-[#111418] text-base font-normal leading-normal flex-1 truncate">Take a video</p>
              </div>
              <div class="flex items-center gap-4 bg-white px-4 min-h-14">
                <div class="text-[#111418] flex items-center justify-center rounded-lg bg-[#f0f2f4] shrink-0 size-10" data-icon="GridFour" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,80H136V56h64ZM120,56v64H56V56ZM56,136h64v64H56Zm144,64H136V136h64v64Z"
                    ></path>
                  </svg>
                </div>
                <p class="text-[#111418] text-base font-normal leading-normal flex-1 truncate">Use a template</p>
              </div>
              <div class="flex items-center gap-4 bg-white px-4 min-h-14">
                <div class="text-[#111418] flex items-center justify-center rounded-lg bg-[#f0f2f4] shrink-0 size-10" data-icon="Trophy" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M232,64H208V56a16,16,0,0,0-16-16H64A16,16,0,0,0,48,56v8H24A16,16,0,0,0,8,80V96a40,40,0,0,0,40,40h3.65A80.13,80.13,0,0,0,120,191.61V216H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V191.58c31.94-3.23,58.44-25.64,68.08-55.58H208a40,40,0,0,0,40-40V80A16,16,0,0,0,232,64ZM48,120A24,24,0,0,1,24,96V80H48v32q0,4,.39,8Zm144-8.9c0,35.52-28.49,64.64-63.51,64.9H128a64,64,0,0,1-64-64V56H192ZM232,96a24,24,0,0,1-24,24h-.5a81.81,81.81,0,0,0,.5-8.9V80h24Z"
                    ></path>
                  </svg>
                </div>
                <p class="text-[#111418] text-base font-normal leading-normal flex-1 truncate">Celebrate an occasion</p>
              </div>
              <div class="flex items-center gap-4 bg-white px-4 min-h-14">
                <div class="text-[#111418] flex items-center justify-center rounded-lg bg-[#f0f2f4] shrink-0 size-10" data-icon="Calendar" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z"
                    ></path>
                  </svg>
                </div>
                <p class="text-[#111418] text-base font-normal leading-normal flex-1 truncate">Create an event</p>
              </div>
              <div class="flex items-center gap-4 bg-white px-4 min-h-14">
                <div class="text-[#111418] flex items-center justify-center rounded-lg bg-[#f0f2f4] shrink-0 size-10" data-icon="Briefcase" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path
                      d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.37V200ZM104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112Z"
                    ></path>
                  </svg>
                </div>
                <p class="text-[#111418] text-base font-normal leading-normal flex-1 truncate">Share that you're hiring</p>
              </div>
            </div>
          </div>
        </div>
        <div class="h-5 bg-white"></div>
      </div>
    </div>
  </body>
</html>
