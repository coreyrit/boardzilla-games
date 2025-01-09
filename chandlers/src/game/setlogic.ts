
export class SetLogic {
    static countSets(sets: Set<string>[]) : number {
        const allValues = new Set<string>();
        for(const set of sets) {
          for(const val of set) {
            allValues.add(val);
          }
        }

        var uniqueCount = 0;
    
        // find what sets each color shows up
        const allSets : Set<number>[] = []
        allValues.forEach(x => {
          const freq = new Set<number>();
          for(var k = 0; k < sets.length; k++) {
            if(sets[k].has(x)) {
              freq.add(k);
            }
          }
          allSets.push(freq);
        })

        // sort the sets
        allSets.sort((x, y) => x.size - y.size);
    
        // iterate through and pick out elements and count uniques
        for(var i = 0; i < allSets.length; i++) {
          if(allSets[i].size > 0) {
            uniqueCount++;
            const index : number = allSets[i].values().next().value
            for(var j = i+1; j < allSets.length; j++) {
              allSets[j].delete(index);
            }
          }
        }
    
        return uniqueCount;
      }
}