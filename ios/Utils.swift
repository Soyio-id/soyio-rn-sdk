//
// Utils - Soyio SDK utility functions
//

import Foundation

struct SoyioUtils {
    static func getCurrentDateISO() -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        return formatter.string(from: Date())
    }
}
