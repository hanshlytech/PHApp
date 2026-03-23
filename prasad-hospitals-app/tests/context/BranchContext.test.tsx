import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { BranchProvider, useBranch } from '../../src/context/BranchContext'
import { branches } from '../../src/data/mockData'

const wrapper = ({ children }: { children: ReactNode }) => (
  <BranchProvider>{children}</BranchProvider>
)

describe('BranchContext', () => {
  beforeEach(() => sessionStorage.clear())

  it('starts with no branch selected', () => {
    const { result } = renderHook(() => useBranch(), { wrapper })
    expect(result.current.branch).toBeNull()
  })

  it('sets and returns the selected branch', () => {
    const { result } = renderHook(() => useBranch(), { wrapper })
    act(() => result.current.setBranch(branches[0]))
    expect(result.current.branch?.id).toBe('kukatpally')
  })

  it('persists branch to sessionStorage', () => {
    const { result } = renderHook(() => useBranch(), { wrapper })
    act(() => result.current.setBranch(branches[1]))
    const stored = JSON.parse(sessionStorage.getItem('selectedBranch') ?? 'null')
    expect(stored?.id).toBe('secunderabad')
  })

  it('clears the branch', () => {
    const { result } = renderHook(() => useBranch(), { wrapper })
    act(() => result.current.setBranch(branches[0]))
    act(() => result.current.clearBranch())
    expect(result.current.branch).toBeNull()
    expect(sessionStorage.getItem('selectedBranch')).toBeNull()
  })
})
