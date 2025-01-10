
export class IdSet {
  id: string
  set: Set<string>

  constructor(id: string, set: string[]) {
    this.id = id;
    this.set = new Set(set);
  }
}


export class SetLogic {

      static setValues(sets: IdSet[]) : Set<string> {
        const allValues = new Set<string>();
        for(const set of sets) {
          for(const val of set.set) {
            allValues.add(val);
          }
        }
        return allValues;
      }

      static mapValues(sets: IdSet[]) : Map<string, number> {
        const allValues = new Map<string, number>();
        for(const set of sets) {
          for(const val of set.set) {
            if(!allValues.has(val)) {
              allValues.set(val, 0);
            }
            allValues.set(val, allValues.get(val)+1);
          }
        }
        return allValues;
      }

      static fiveColors(sets: IdSet[]) : boolean {
        return SetLogic.setValues(sets).size >= 5;
      }

      static oneByFive(sets: IdSet[]) : boolean {
        return sets.length >= 5;
      }

      static threeByThreeOtherwise(sets: IdSet[]) : boolean {
        const allValues = SetLogic.setValues(sets);
        var uniqueCount = 0;
    
        // find what sets each color shows up
        const allSets : Set<number>[] = []
        allValues.forEach(x => {
          const freq = new Set<number>();
          for(var k = 0; k < sets.length; k++) {
            if(sets[k].set.has(x)) {
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
    
        return uniqueCount >= 3;
      }

      static twoByTwo(sets: IdSet[]) : boolean {
        const mapKeys = new Map<string, number>();
        for(const set of sets) { mapKeys.set(set.id, 0) }
        sets.filter(x => x.set.size >= 2).forEach(x => mapKeys.set(x.id, mapKeys.get(x.id)!+1));

        return Array.from(mapKeys.values()).filter(x => x >= 2).length > 0;
      }

      static threeByThreeLikewise(sets: IdSet[]) : boolean {
        const allValues = SetLogic.setValues(sets);
        const mapValues = new Map<string, number>();
        for(const val of allValues) { mapValues.set(val, 0) }
        sets.forEach(x => x.set.forEach(y => mapValues.set(y, mapValues.get(y)!+1)))
        return Array.from(mapValues.values()).filter(x => x >= 3).length > 0;
      }

      static twoPairs(sets: IdSet[]) : boolean {
        const allValues = SetLogic.mapValues(sets);
        return Array.from(allValues.values()).filter(x => x >= 2).length >= 2;
      }

      static twoByThree(sets: IdSet[]) : boolean {
        return sets.filter(x => x.set.size >= 2).length >= 3;
      }

}