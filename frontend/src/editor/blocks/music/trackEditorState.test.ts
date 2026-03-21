import { describe, expect, it } from 'vitest'
import type { MusicBlockProps, MusicTrack } from '@/editor/types'
import {
  addTrack,
  moveTrack,
  removeTrack,
  syncLegacyMirror,
  updateTrackAtIndex,
} from '@/editor/blocks/music/trackEditorState'

function createTrack(seed: string): MusicTrack {
  return {
    src: `https://cdn.example.com/${seed}.mp3`,
    assetId: `asset-${seed}`,
    title: `Title ${seed}`,
    artist: `Artist ${seed}`,
    coverSrc: `https://cdn.example.com/${seed}.jpg`,
    coverAssetId: `cover-${seed}`,
  }
}

describe('trackEditorState', () => {
  it('adds and removes tracks keeping a valid active index', () => {
    const first = addTrack([])
    expect(first.tracks).toHaveLength(1)
    expect(first.activeIndex).toBe(0)

    const second = addTrack(first.tracks)
    expect(second.tracks).toHaveLength(2)
    expect(second.activeIndex).toBe(1)

    const removed = removeTrack(second.tracks, 1, second.activeIndex)
    expect(removed.tracks).toHaveLength(1)
    expect(removed.activeIndex).toBe(0)
  })

  it('reorders tracks preserving content and active selection semantics', () => {
    const tracks = [createTrack('a'), createTrack('b'), createTrack('c')]
    const movedUp = moveTrack(tracks, 2, 'up', 2)
    expect(movedUp.tracks.map((track) => track.src)).toEqual([
      tracks[0].src,
      tracks[2].src,
      tracks[1].src,
    ])
    expect(movedUp.activeIndex).toBe(1)

    const movedDown = moveTrack(movedUp.tracks, 0, 'down', movedUp.activeIndex)
    expect(movedDown.tracks.map((track) => track.src)).toEqual([
      tracks[2].src,
      tracks[0].src,
      tracks[1].src,
    ])
    expect(movedDown.activeIndex).toBe(0)
  })

  it('updates one track by index without leaking to others', () => {
    const tracks = [createTrack('a'), createTrack('b'), createTrack('c')]
    const updated = updateTrackAtIndex(tracks, 1, { title: 'Only middle changed' }, 0)

    expect(updated.tracks[0].title).toBe('Title a')
    expect(updated.tracks[1].title).toBe('Only middle changed')
    expect(updated.tracks[2].title).toBe('Title c')
    expect(updated.tracks[0].src).toBe(tracks[0].src)
    expect(updated.tracks[2].src).toBe(tracks[2].src)
  })

  it('syncs legacy mirror from active track and falls back to first valid', () => {
    const props: MusicBlockProps = {
      src: '',
      assetId: undefined,
      title: '',
      artist: '',
      coverSrc: '',
      coverAssetId: undefined,
      tracks: [
        {
          src: 'https://cdn.example.com/first.mp3',
          assetId: 'asset-first',
          title: 'First',
          artist: 'A',
          coverSrc: 'https://cdn.example.com/first.jpg',
          coverAssetId: 'cover-first',
        },
        {
          src: 'invalid-src',
          assetId: 'asset-invalid',
          title: 'Invalid',
          artist: 'B',
          coverSrc: '',
        },
      ],
    }

    const activeMirror = syncLegacyMirror(props, 0)
    expect(activeMirror.src).toBe('https://cdn.example.com/first.mp3')
    expect(activeMirror.assetId).toBe('asset-first')
    expect(activeMirror.title).toBe('First')

    const fallbackMirror = syncLegacyMirror(props, 1)
    expect(fallbackMirror.src).toBe('https://cdn.example.com/first.mp3')
    expect(fallbackMirror.assetId).toBe('asset-first')
  })

  it('returns coherent empty legacy mirror when no valid track exists', () => {
    const emptyProps: MusicBlockProps = {
      src: 'https://legacy.example.com/single.mp3',
      assetId: 'legacy-asset',
      title: 'Legacy',
      artist: 'Legacy Artist',
      coverSrc: 'https://legacy.example.com/cover.jpg',
      coverAssetId: 'legacy-cover',
      tracks: [],
    }

    const emptyMirror = syncLegacyMirror(emptyProps, 0)
    expect(emptyMirror).toEqual({
      src: '',
      assetId: undefined,
      title: '',
      artist: '',
      coverSrc: '',
      coverAssetId: undefined,
    })

    const oneTrackProps: MusicBlockProps = {
      ...emptyProps,
      tracks: [createTrack('single')],
    }
    const oneMirror = syncLegacyMirror(oneTrackProps, 0)
    expect(oneMirror.src).toBe('https://cdn.example.com/single.mp3')
    expect(oneMirror.title).toBe('Title single')
  })
})
