import { Vector2 } from "../utils/vector2"
import { getPointsSegmentInRect, expandSegment } from "./actor"

function pointsToArray(points: Vector2[]) {
    return points.map((point) => point.toArray().map((x) => Math.round(x * 1000) / 1000));
}

describe("两交点测试", () => {
    it('左下到左上, 线段与矩形有两个交点', () => {
        const points = getPointsSegmentInRect(new Vector2(-0.2, -0.4), new Vector2(0.4, 0.2), 0, 1, -1, 0);
        expect(pointsToArray(points)).toIncludeSameMembers([[0, -0.2], [0.2, 0]]);    
    })

    it('左上到右下, 线段与矩形有两个交点', () => {
        const points = getPointsSegmentInRect(new Vector2(0.6, 0.2), new Vector2(1.2, -0.4), 0, 1, -1, 0);
        expect(pointsToArray(points)).toIncludeSameMembers([[0.8, 0], [1, -0.2]]);
    });

    it('左到右, 线段与矩形有两个交点', () => {
        const points = getPointsSegmentInRect(new Vector2(-1, -0.5), new Vector2(2, -0.5), 0, 1, -1, 0);
        expect(pointsToArray(points)).toIncludeSameMembers([[0, -0.5], [1, -0.5]]);        
    })

    it("上到下, 线段与和矩形有两个交点", () => {
        const points = getPointsSegmentInRect(new Vector2(0.5, 1), new Vector2(0.5, -1), 0, 1, -1, 0);
        expect(pointsToArray(points)).toIncludeSameMembers([[0.5, 0], [0.5, -1]]);
    })
});

describe("单交点测试", () => {
    it('测试1', () => {
        const points = getPointsSegmentInRect(new Vector2(2, 2), new Vector2(3, 3), 0, 1, -1, 0);
        expect(pointsToArray(points)).toIncludeSameMembers([[0, 0]]);    
    })
});

describe("无交点测试", () => {
    it('测试1', () => {
        const points = getPointsSegmentInRect(new Vector2(2, 3), new Vector2(3, 3), 0, 1, -1, 0);
        expect(points).toBeEmpty();    
    })
});

describe("延长线段", () => {
    it("左下到右上", () => {
        expect(expandSegment(new Vector2(1,1), new Vector2(2,3), 1)).toStrictEqual(new Vector2(2.447213595499958, 3.8944271909999157));
    })
    it("左上到右下", () => {
        expect(expandSegment(new Vector2(-1,1), new Vector2(2,-3), 1)).toStrictEqual(new Vector2(2.6, -3.8));
    })
    it("右上到左下", () => {
        expect(expandSegment(new Vector2(1,1), new Vector2(-2,-3), 1)).toStrictEqual(new Vector2(-2.6, -3.8));
    })
    it("右下到左上", () => {
        expect(expandSegment(new Vector2(1,-1), new Vector2(-2,3), 1)).toStrictEqual(new Vector2(-2.6, 3.8));
    })
    it("左到右", () => {
        expect(expandSegment(new Vector2(-1,1), new Vector2(3,1), 1)).toStrictEqual(new Vector2(4, 1));
    })
    it("右到左", () => {
        expect(expandSegment(new Vector2(3,1), new Vector2(-1,1), 1)).toStrictEqual(new Vector2(-2, 1));
    })
    it("上到下", () => {
        expect(expandSegment(new Vector2(3,3), new Vector2(3,1), 1)).toStrictEqual(new Vector2(3, 0));
    })
    it("下到上", () => {
        expect(expandSegment(new Vector2(3,1), new Vector2(3,3), 1)).toStrictEqual(new Vector2(3, 4));
    })
})