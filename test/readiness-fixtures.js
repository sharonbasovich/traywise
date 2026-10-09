// New UI regression fixtures, separate from the frozen model evaluation worlds.
export function constantHistory(count,unknownIndices=[]){const unknown=new Set(unknownIndices);return Array.from({length:count},(_,i)=>({date:new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),prepared:110,served:100,leftovers:10,observation_status:unknown.has(i)?'lower_bound':'complete_service',requested_count:null,event:0}));}
export const unknownCalibration=Array.from({length:12},(_,i)=>36+i);
