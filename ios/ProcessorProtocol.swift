import FaceTecSDK

// Protocol that allows all FaceTec processors to share a common interface
protocol Processor: AnyObject {
    func isSuccess() -> Bool
}
