import { useReducer } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

type UndoRedoAction<T> = 
  | { type: 'SET'; payload: T }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR'; payload: T }; 

function undoRedoReducer<T>(
  state: UndoRedoState<T>,
  action: UndoRedoAction<T>
): UndoRedoState<T> {
  const { past, present, future } = state;

  switch (action.type) {
    case 'SET':
      return {
        past: [...past, present],
        present: action.payload,
        future: []
      };
    case 'UNDO':
      if (past.length === 0) return state;
      return {
        past: past.slice(0, -1),
        present: past[past.length - 1],
        future: [present, ...future]
      };
    case 'REDO':
      if (future.length === 0) return state;
      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1)
      };
    case 'CLEAR':
      return {
        past: [],
        present: action.payload,
        future: []
      };
    default:
      return state;
  }
}

export function useUndoRedo<T>(initialState: T) {
  const [state, dispatch] = useReducer(undoRedoReducer, {
    past: [],
    present: initialState,
    future: []
  });

  return {
    state: state.present,
    setState: (newState: T) => dispatch({ type: 'SET', payload: newState }),
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    clear: (newState: T) => dispatch({ type: 'CLEAR', payload: newState }),
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0
  };
}
