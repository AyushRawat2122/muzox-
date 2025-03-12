import { create } from "zustand";

const useAudioPlayer = create((set, get) => ({
  currentSong: null,
  currentSongIdx: 0,
  queue: [],
  isPlaying: false,
  isLooped: false,
  isShuffled: false,
  originalQueue: [], //backup for shuffle

  // plays the next song
  playNext: () => {
    const currentIdx = get().currentSongIdx;
    const queue = get().queue;
    const isLooped = get().isLooped;
    if (!queue) {
      return;
    } // checks if the queue exists or not

    if (isLooped && currentIdx >= queue?.length - 1) {
      set((state) => ({
        currentSongIdx: 0,
        currentSong: state.queue?.[0],
        isPlaying: true,
      }));
    }
    // set the current index to the very start of the queue
    else if (!isLooped && currentIdx >= queue?.length - 1) {
      return;
    }
    // checks preventing the current song from incrementing to undefined
    else {
      set((state) => ({
        currentSongIdx: state.currentSongIdx + 1,
        currentSong: state.queue?.[state.currentSongIdx + 1],
        isPlaying: true,
      })); //change the current index and current song state
    }
  },
  //plays the prev song
  playPrev: () => {
    const currentIdx = get().currentSongIdx;
    const queue = get().queue;

    if (!queue) {
      return;
    } // checks if the queue exists or not

    if (currentIdx <= 0) {
      return;
    } // checks preventing the current song from decrementing to undefined

    set((state) => ({
      currentSongIdx: state.currentSongIdx - 1,
      currentSong: state.queue?.[state.currentSongIdx - 1],
      isPlaying: true,
    })); //change the current index and current song state
  },
  //Initialize the queue
  initializeQueue: (queue) => {
    if (queue?.length === 0) {
      return;
    } // if its empty array then return
    set({ queue: [...queue], currentSong: queue[0], isPlaying: true }); // initialize the queue
  },
  //shuffling the queue
  shuffleQueue: () => {
    const currentSong = get().currentSong;
    const queue = get().queue;
    const isShuffled = get().isShuffled;

    if (!isShuffled) {
      // first save the original queue
      set({ originalQueue: [...queue], isShuffled: true });
    }

    const filterQueue = queue.filter((song) => song !== currentSong);

    let temp;
    if (filterQueue.length === 0) return;
    for (let i = filterQueue.length - 1; i > 0; i--) {
      const randIdx = Math.floor(Math.random() * i);
      temp = filterQueue[i];
      filterQueue[i] = filterQueue[randIdx];
      filterQueue[randIdx] = temp;
    }

    set({
      queue: [currentSong, ...filterQueue],
      currentSongIdx: 0,
    });
  },
  //shuffle Back the queue
  shuffleBack: () => {
    const { originalQueue, isShuffled, currentSong } = get();
    if (!isShuffled || !originalQueue.length) return;
    const currentIdx = originalQueue.findIndex((song) => song === currentSong);
    set({ queue: [...originalQueue], isShuffled: false, currentSongIdx: currentIdx });
  },
  //toggle the play and pause in order to stop or play
  togglePlayPause: () => {
    set((state) => ({ isPlaying: !state.isPlaying })); // toggle the play pause logic
  },
  //toggle the option to loop the entire queue : to play again after finishing all songs
  toggleLooping: () => {
    set((state) => ({ isLooped: !state.isLooped })); // toggle the Loop logic
  },
  //set current Song
  setCurrentSong: (currentIdx) => {
    const queue = get().queue;
    if (!queue) {
      return;
    } // checks if the queue exists or not

    if (currentIdx < 0 || currentIdx > queue.length - 1) {
      return;
    } // checks preventing the current song to set undefined
    set((state) => ({
      currentSongIdx: currentIdx,
      currentSong: state.queue[currentIdx],
      isPlaying: true,
    }));
  },
}));

export default useAudioPlayer;
